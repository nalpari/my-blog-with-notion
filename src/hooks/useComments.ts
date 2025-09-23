'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CommentWithReplies } from '@/types/supabase'
import { PresenceUser, PublicComment } from '@/lib/realtime/realtime-manager'
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


  // Helper function to recursively insert a reply into the comment tree
  const insertReplyRecursively = useCallback((
    comments: CommentWithReplies[],
    parentId: string | null,
    newComment: CommentWithReplies
  ): CommentWithReplies[] => {
    // If parentId is null, return unchanged (shouldn't happen in this context)
    if (!parentId) return comments

    return comments.map(comment => {
      // Found the parent comment
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newComment]
        }
      }

      // If this comment has replies, recursively search them
      if (comment.replies && comment.replies.length > 0) {
        const updatedReplies = insertReplyRecursively(comment.replies, parentId, newComment)
        // Only create a new object if replies actually changed
        if (updatedReplies !== comment.replies) {
          return {
            ...comment,
            replies: updatedReplies
          }
        }
      }

      // No changes needed for this comment
      return comment
    })
  }, [])

  // Helper to convert PublicComment to CommentWithReplies format
  // This adds the missing fields with null values for compatibility
  const toCommentWithReplies = useCallback((comment: CommentWithReplies | PublicComment): CommentWithReplies => {
    if ('user_email' in comment) {
      // Already a CommentWithReplies
      return comment
    }
    // Convert PublicComment to CommentWithReplies
    return {
      ...comment,
      user_email: null, // Add missing field with null value
      deleted_at: null, // Add missing field with null value
      replies: comment.replies?.map(toCommentWithReplies)
    } as CommentWithReplies
  }, [])

  // Handle real-time updates
  const handleCommentAdded = useCallback((newComment: CommentWithReplies | PublicComment) => {
    const comment = toCommentWithReplies(newComment)
    if (comment.parent_id) {
      // Add reply to parent comment using recursive helper
      setComments(prev => insertReplyRecursively(prev, comment.parent_id, comment))
    } else {
      // Add new top-level comment
      setComments(prev => [comment, ...prev])
    }
  }, [insertReplyRecursively, toCommentWithReplies])

  const handleCommentUpdated = useCallback((updatedComment: CommentWithReplies | PublicComment) => {
    const comment = toCommentWithReplies(updatedComment)
    // Helper function to recursively update a comment node in the tree
    const updateNodeRecursively = (node: CommentWithReplies): CommentWithReplies => {
      // If this is the node to update, return the updated version
      if (node.id === comment.id) {
        return comment
      }

      // If this node has replies, recursively check and update them
      if (node.replies && node.replies.length > 0) {
        const updatedReplies = node.replies.map(reply => updateNodeRecursively(reply))

        // Only create a new object if replies actually changed
        const repliesChanged = updatedReplies.some((reply, index) => reply !== node.replies![index])
        if (repliesChanged) {
          return { ...node, replies: updatedReplies }
        }
      }

      // No changes needed for this node
      return node
    }

    // Update the comments tree
    setComments(prev => prev.map(root => updateNodeRecursively(root)))
  }, [toCommentWithReplies])

  const handleCommentDeleted = useCallback((deletedIds: string[]) => {
    setComments(prev => {
      // Helper function to mark deleted comments with is_deleted flag recursively
      const markAsDeleted = (comments: CommentWithReplies[]): CommentWithReplies[] => {
        return comments.map(comment => {
          // If this comment is in the deleted list, mark it as deleted
          if (deletedIds.includes(comment.id)) {
            return {
              ...comment,
              is_deleted: true,
              content: '[This comment has been deleted]',
              replies: comment.replies ? markAsDeleted(comment.replies) : []
            }
          }

          // If not deleted, recursively check replies
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: markAsDeleted(comment.replies)
            }
          }

          return comment
        })
      }

      // Mark all deleted comments with is_deleted flag
      return markAsDeleted(prev)
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
        userId: user?.id,  // PII Security: Use userId instead of email
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

      // Update cache for all deleted comments (pass all IDs at once)
      commentCache.deleteComment(postSlug, result.deletedIds)

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