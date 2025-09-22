'use client'

import { useEffect, useRef, useCallback } from 'react'
import { RealtimeManager, PresenceUser } from '@/lib/realtime/realtime-manager'
import { CommentWithReplies } from '@/types/supabase'

interface UseRealtimeCommentsOptions {
  postSlug: string
  enabled?: boolean
  onCommentAdded?: (comment: CommentWithReplies) => void
  onCommentUpdated?: (comment: CommentWithReplies) => void
  onCommentDeleted?: (commentId: string) => void
  onTyping?: (userId: string, userName: string) => void
  onUsersChanged?: (users: PresenceUser[]) => void
}

export function useRealtimeComments({
  postSlug,
  enabled = true,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
  onTyping,
  onUsersChanged,
}: UseRealtimeCommentsOptions) {
  const managerRef = useRef<RealtimeManager | null>(null)

  useEffect(() => {
    if (!postSlug || !enabled) return

    // Create realtime manager
    const manager = new RealtimeManager(postSlug)
    managerRef.current = manager

    // Setup event listeners
    const unsubscribers: (() => void)[] = []

    if (onCommentAdded) {
      unsubscribers.push(
        manager.on('comment:new', onCommentAdded)
      )
    }

    if (onCommentUpdated) {
      unsubscribers.push(
        manager.on('comment:update', onCommentUpdated)
      )
    }

    if (onCommentDeleted) {
      unsubscribers.push(
        manager.on('comment:delete', onCommentDeleted)
      )
    }

    if (onTyping) {
      unsubscribers.push(
        manager.on('user:typing', onTyping)
      )
    }

    if (onUsersChanged) {
      unsubscribers.push(
        manager.on('presence:sync', onUsersChanged)
      )
    }

    // Subscribe to channel
    manager.subscribe()

    // Cleanup
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
      manager.unsubscribe()
      managerRef.current = null
    }
  }, [postSlug, enabled, onCommentAdded, onCommentUpdated, onCommentDeleted, onTyping, onUsersChanged])

  // Broadcast functions
  const broadcastNewComment = useCallback((comment: CommentWithReplies) => {
    managerRef.current?.broadcastNewComment(comment)
  }, [])

  const broadcastCommentUpdate = useCallback((comment: CommentWithReplies) => {
    managerRef.current?.broadcastCommentUpdate(comment)
  }, [])

  const broadcastCommentDelete = useCallback((commentId: string) => {
    managerRef.current?.broadcastCommentDelete(commentId)
  }, [])

  const broadcastTyping = useCallback(() => {
    managerRef.current?.broadcastTyping()
  }, [])

  const getOnlineUsersCount = useCallback(() => {
    return managerRef.current?.getOnlineUsersCount() || 0
  }, [])

  return {
    broadcastNewComment,
    broadcastCommentUpdate,
    broadcastCommentDelete,
    broadcastTyping,
    getOnlineUsersCount,
    isConnected: managerRef.current?.isSubscribed() || false,
  }
}