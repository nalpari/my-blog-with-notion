'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CommentWithReplies } from '@/types/supabase'
import { PresenceUser } from '@/lib/realtime/realtime-manager'
import { useRealtimeComments } from './useRealtimeComments'
import { commentsService } from '@/services/comments.service'
import { useAuth } from './useAuth'
import { commentCache } from '@/lib/cache/comment-cache'

interface UseCommentsOptions {
  postSlug: string
  initialComments?: CommentWithReplies[]
  enableRealtime?: boolean
}

interface TypingUser {
  userId: string
  userName: string
  timestamp: number
}

export function useComments({
  postSlug,
  initialComments = [],
  enableRealtime = true
}: UseCommentsOptions) {
  const [comments, setComments] = useState<CommentWithReplies[]>(initialComments)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map())
  const { user } = useAuth()

  // Clean up stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => {
        const now = Date.now()
        const updated = new Map(prev)
        let hasChanges = false

        for (const [userId, data] of updated) {
          if (now - data.timestamp > 3000) {
            updated.delete(userId)
            hasChanges = true
          }
        }

        return hasChanges ? updated : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])


  // Handle real-time updates
  const handleCommentAdded = useCallback((newComment: CommentWithReplies) => {
    if (newComment.parent_id) {
      // Add reply to parent comment
      setComments(prev => prev.map(comment => {
        if (comment.id === newComment.parent_id) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment]
          }
        }
        // Check nested replies
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === newComment.parent_id) {
              return {
                ...reply,
                replies: [...(reply.replies || []), newComment]
              }
            }
            return reply
          })
          return { ...comment, replies: updatedReplies }
        }
        return comment
      }))
    } else {
      // Add new top-level comment
      setComments(prev => [newComment, ...prev])
    }
  }, [])

  const handleCommentUpdated = useCallback((updatedComment: CommentWithReplies) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === updatedComment.id) {
        return updatedComment
      }
      // Check replies
      if (comment.replies) {
        const updatedReplies = comment.replies.map(reply =>
          reply.id === updatedComment.id ? updatedComment : reply
        )
        return { ...comment, replies: updatedReplies }
      }
      return comment
    }))
  }, [])

  const handleCommentDeleted = useCallback((deletedIds: string[]) => {
    setComments(prev => {
      // Helper function to remove all deleted IDs from replies recursively
      const removeFromReplies = (replies: CommentWithReplies[]): CommentWithReplies[] => {
        return replies
          .filter(reply => !deletedIds.includes(reply.id))
          .map(reply => ({
            ...reply,
            replies: reply.replies ? removeFromReplies(reply.replies) : []
          }))
      }

      // Filter out all deleted comments from top level and recursively from replies
      return prev
        .filter(comment => !deletedIds.includes(comment.id))
        .map(comment => ({
          ...comment,
          replies: comment.replies ? removeFromReplies(comment.replies) : []
        }))
    })
  }, [])

  const handleTyping = useCallback((userId: string, userName: string) => {
    // Don't show typing indicator for current user
    if (userId === user?.id) return

    setTypingUsers(prev => {
      const updated = new Map(prev)
      updated.set(userId, { userId, userName, timestamp: Date.now() })
      return updated
    })
  }, [user?.id])

  const handleUsersChanged = useCallback((users: PresenceUser[]) => {
    setOnlineUsers(users)
  }, [])

  const {
    broadcastNewComment,
    broadcastCommentUpdate,
    broadcastCommentDelete,
    broadcastTyping,
    getOnlineUsersCount,
    isConnected
  } = useRealtimeComments({
    postSlug,
    enabled: enableRealtime,
    onCommentAdded: handleCommentAdded,
    onCommentUpdated: handleCommentUpdated,
    onCommentDeleted: (commentId: string) => handleCommentDeleted([commentId]),
    onTyping: handleTyping,
    onUsersChanged: handleUsersChanged,
  })

  // Load comments
  const loadComments = useCallback(async (append = false, forceRefresh = false) => {
    // Check cache first if not appending and not forcing refresh
    if (!append && !forceRefresh) {
      const cachedData = commentCache.get(postSlug)
      if (cachedData) {
        setComments(cachedData.data)
        setHasMore(cachedData.hasMore)
        setCursor(cachedData.cursor)
        return // Use cached data
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await commentsService.fetchComments(postSlug, {
        cursor: append ? cursor : undefined,
      } as { cursor?: string })

      // API already returns comments with replies, no need to rebuild tree
      const commentsWithReplies = data.comments

      if (append) {
        setComments(prev => {
          const updated = [...prev, ...commentsWithReplies]
          // Update cache with appended data
          commentCache.set(postSlug, updated, data.cursor, data.hasMore)
          return updated
        })
      } else {
        setComments(commentsWithReplies)
        // Cache the new data
        commentCache.set(postSlug, commentsWithReplies, data.cursor, data.hasMore)
      }

      setHasMore(data.hasMore)
      setCursor(data.cursor)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [postSlug, cursor])

  // Create comment
  const createComment = useCallback(async (content: string, parentId?: string | null) => {
    try {
      const newComment = await commentsService.createComment({
        postSlug,
        content,
        parentId,
        userName: user?.user_metadata?.name,
        userEmail: user?.email,
      })

      // Update local state immediately (optimistic update)
      handleCommentAdded(newComment)

      // Update cache
      commentCache.addComment(postSlug, newComment)

      // Broadcast to other users
      if (enableRealtime) {
        broadcastNewComment(newComment)
      }

      return newComment
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [postSlug, user, enableRealtime, broadcastNewComment, handleCommentAdded])

  // Update comment
  const updateComment = useCallback(async (commentId: string, content: string) => {
    try {
      const updatedComment = await commentsService.updateComment(commentId, content)

      // Update local state immediately
      handleCommentUpdated(updatedComment)

      // Update cache
      commentCache.updateComment(postSlug, updatedComment)

      // Broadcast to other users
      if (enableRealtime) {
        broadcastCommentUpdate(updatedComment)
      }

      return updatedComment
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [enableRealtime, broadcastCommentUpdate, handleCommentUpdated, postSlug])

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const result = await commentsService.deleteComment(commentId)

      // Update local state immediately with all deleted IDs
      handleCommentDeleted(result.deletedIds)

      // Update cache for all deleted comments
      result.deletedIds.forEach(id => {
        commentCache.deleteComment(postSlug, id)
      })

      // Broadcast to other users (send all deleted IDs)
      if (enableRealtime) {
        result.deletedIds.forEach(id => {
          broadcastCommentDelete(id)
        })
      }
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [enableRealtime, broadcastCommentDelete, handleCommentDeleted, postSlug])

  // Send typing indicator
  const sendTypingIndicator = useCallback(() => {
    if (enableRealtime) {
      broadcastTyping()
    }
  }, [enableRealtime, broadcastTyping])

  // Initial load
  useEffect(() => {
    if (postSlug && comments.length === 0) {
      loadComments()
    }
  }, [postSlug, comments.length, loadComments])

  // Calculate typing users list
  const typingUsersList = useMemo(() => {
    return Array.from(typingUsers.values())
      .filter(u => u.userId !== user?.id)
      .map(u => u.userName)
  }, [typingUsers, user?.id])

  // Calculate online count
  const onlineCount = useMemo(() => {
    return onlineUsers.length || getOnlineUsersCount()
  }, [onlineUsers, getOnlineUsersCount])

  return {
    comments,
    isLoading,
    error,
    hasMore,
    onlineUsers,
    onlineCount,
    typingUsers: typingUsersList,
    isRealtimeConnected: isConnected,
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    sendTypingIndicator,
    loadMore: () => loadComments(true),
    refresh: () => loadComments(false, true),
    clearCache: () => commentCache.invalidate(postSlug),
  }
}