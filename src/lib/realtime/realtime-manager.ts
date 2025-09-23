'use client'

import { getSupabaseClient } from '@/lib/supabase/client'
import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js'
import { CommentWithReplies } from '@/types/supabase'

// Public comment type that excludes sensitive fields
export interface PublicComment {
  id: string
  post_slug: string
  parent_id: string | null
  user_id: string | null
  user_name: string | null
  user_avatar: string | null
  content: string
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  replies?: PublicComment[]
}

// Typed broadcast payloads to prevent PII leakage
export interface BroadcastPayloads {
  'comment:new': {
    comment: PublicComment
  }
  'comment:update': {
    comment: PublicComment
  }
  'comment:delete': {
    commentId: string
  }
  'user:typing': {
    userId: string
    userName: string
  }
}

export interface RealtimeEvents {
  'comment:new': (comment: PublicComment) => void
  'comment:update': (comment: PublicComment) => void
  'comment:delete': (commentId: string) => void
  'user:typing': (userId: string, userName: string) => void
  'presence:sync': (users: PresenceUser[]) => void
}

export interface PresenceUser {
  user_id: string
  user_name: string
  user_avatar?: string
  online_at: string
}

export interface TypingUser {
  userId: string
  userName: string
  timestamp: number
}

// Helper type for type-safe listener map
type ListenerMap = {
  [K in keyof RealtimeEvents]: Set<RealtimeEvents[K]>
}

export class RealtimeManager {
  private channel: RealtimeChannel | null = null
  private listeners: Partial<ListenerMap> = {}
  private typingTimeout: ReturnType<typeof setTimeout> | null = null
  private currentUser: PresenceUser | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private isConnected = false

  /**
   * Sanitize comment to remove sensitive fields (PII)
   */
  private toPublicComment(comment: CommentWithReplies): PublicComment {
    const publicComment: PublicComment = {
      id: comment.id,
      post_slug: comment.post_slug,
      parent_id: comment.parent_id,
      user_id: comment.user_id,
      user_name: comment.user_name,
      user_avatar: comment.user_avatar,
      content: comment.content,
      is_edited: comment.is_edited,
      is_deleted: comment.is_deleted,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    }

    // Recursively sanitize replies if present
    if (comment.replies && comment.replies.length > 0) {
      publicComment.replies = comment.replies.map(reply => this.toPublicComment(reply))
    }

    // Explicitly exclude sensitive fields like user_email, deleted_at
    // These fields are not copied to the public comment
    return publicComment
  }
  private connectionListeners = new Set<(connected: boolean) => void>()

  constructor(private postSlug: string) {}

  /**
   * Subscribe to realtime events
   */
  async subscribe() {
    if (this.channel) {
      console.warn('Already subscribed to channel')
      return
    }

    const supabase = getSupabaseClient()

    // Get current user info (인증 없어도 작동하도록)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      this.currentUser = {
        user_id: user?.id || `anonymous-${Math.random().toString(36).substring(2, 11)}`,
        user_name: user?.user_metadata?.name || 'Anonymous',
        user_avatar: user?.user_metadata?.avatar_url,
        online_at: new Date().toISOString(),
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // 인증 실패 시 익명 사용자로 처리
      console.log('No authenticated user, using anonymous mode')
      this.currentUser = {
        user_id: `anonymous-${Math.random().toString(36).substring(2, 11)}`,
        user_name: 'Anonymous',
        online_at: new Date().toISOString(),
      }
    }

    // Create channel with broadcast and presence
    this.channel = supabase.channel(`comments:${this.postSlug}`, {
      config: {
        broadcast: {
          self: false,  // Don't receive own broadcasts
          ack: false    // No acknowledgment needed
        },
        presence: {
          key: this.currentUser.user_id
        }
      }
    })

    // Setup broadcast listeners with typed payloads
    if (this.channel) {
      this.channel
        .on('broadcast', { event: 'comment:new' }, ({ payload }: { payload: BroadcastPayloads['comment:new'] }) => {
          // Payload already contains sanitized PublicComment
          this.emit('comment:new', payload.comment)
        })
        .on('broadcast', { event: 'comment:update' }, ({ payload }: { payload: BroadcastPayloads['comment:update'] }) => {
          // Payload already contains sanitized PublicComment
          this.emit('comment:update', payload.comment)
        })
        .on('broadcast', { event: 'comment:delete' }, ({ payload }: { payload: BroadcastPayloads['comment:delete'] }) => {
          this.emit('comment:delete', payload.commentId)
        })
        .on('broadcast', { event: 'user:typing' }, ({ payload }: { payload: BroadcastPayloads['user:typing'] }) => {
          this.emit('user:typing', payload.userId, payload.userName)
        })

      // Setup presence listener
      this.channel.on('presence', { event: 'sync' }, () => {
        const presenceState = this.channel!.presenceState()
        const users = this.getPresenceUsers(presenceState)
        this.emit('presence:sync', users)
      })

      // Subscribe to channel with error handling
      // Note: subscribe() returns RealtimeChannel, not a Promise
      this.channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true
          this.reconnectAttempts = 0
          this.notifyConnectionListeners(true)
          console.log('Realtime connected successfully')

          // Track current user presence after successful subscription
          if (this.currentUser && this.channel) {
            try {
              await this.channel.track(this.currentUser)
              console.log('User presence tracked successfully')
            } catch (error) {
              console.error('Error tracking user presence:', error)
            }
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.isConnected = false
          this.notifyConnectionListeners(false)

          if (status === 'TIMED_OUT') {
            console.warn('Realtime connection timed out, attempting reconnect...')
          }

          this.handleReconnect()
        }
      })
    }
  }

  /**
   * Unsubscribe from realtime events
   */
  async unsubscribe() {
    if (!this.channel) return

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    const supabase = getSupabaseClient()
    await supabase.removeChannel(this.channel)
    this.channel = null
    this.listeners = {}
    this.connectionListeners.clear()
    this.isConnected = false

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
      this.typingTimeout = null
    }
  }

  /**
   * Add event listener
   */
  on<K extends keyof RealtimeEvents>(
    event: K,
    callback: RealtimeEvents[K]
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set<RealtimeEvents[K]>() as ListenerMap[K]
    }
    const eventListeners = this.listeners[event]!
    eventListeners.add(callback)

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners[event]
      if (eventListeners) {
        eventListeners.delete(callback)
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit<K extends keyof RealtimeEvents>(
    event: K,
    ...args: Parameters<RealtimeEvents[K]>
  ) {
    const callbacks = this.listeners[event]
    if (!callbacks) return

    callbacks.forEach(callback => {
      try {
        // Type-safe invocation - callback is already typed as RealtimeEvents[K]
        // We need to cast to extract the function signature
        const typedCallback = callback as (...args: Parameters<RealtimeEvents[K]>) => void
        typedCallback(...args)
      } catch (error) {
        console.error(`Error in ${event} listener:`, error)
      }
    })
  }

  /**
   * Broadcast new comment (sanitized to exclude PII)
   */
  async broadcastNewComment(comment: CommentWithReplies) {
    if (!this.channel) return

    // Sanitize comment before broadcasting to prevent PII leakage
    const publicComment = this.toPublicComment(comment)

    await this.channel.send({
      type: 'broadcast',
      event: 'comment:new',
      payload: { comment: publicComment } as BroadcastPayloads['comment:new']
    })
  }

  /**
   * Broadcast comment update (sanitized to exclude PII)
   */
  async broadcastCommentUpdate(comment: CommentWithReplies) {
    if (!this.channel) return

    // Sanitize comment before broadcasting to prevent PII leakage
    const publicComment = this.toPublicComment(comment)

    await this.channel.send({
      type: 'broadcast',
      event: 'comment:update',
      payload: { comment: publicComment } as BroadcastPayloads['comment:update']
    })
  }

  /**
   * Broadcast comment deletion
   */
  async broadcastCommentDelete(commentId: string) {
    if (!this.channel) return

    await this.channel.send({
      type: 'broadcast',
      event: 'comment:delete',
      payload: { commentId } as BroadcastPayloads['comment:delete']
    })
  }

  /**
   * Broadcast typing indicator
   */
  async broadcastTyping() {
    if (!this.channel || !this.currentUser) return

    // Clear previous timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
    }

    // Send typing event
    await this.channel.send({
      type: 'broadcast',
      event: 'user:typing',
      payload: {
        userId: this.currentUser.user_id,
        userName: this.currentUser.user_name
      } as BroadcastPayloads['user:typing']
    })

    // Set timeout to stop typing indicator
    this.typingTimeout = setTimeout(() => {
      this.typingTimeout = null
    }, 3000)
  }

  /**
   * Get presence users from state
   */
  private getPresenceUsers(state: RealtimePresenceState): PresenceUser[] {
    const users: PresenceUser[] = []

    Object.values(state).forEach(presences => {
      presences.forEach(presence => {
        if (presence && typeof presence === 'object' && 'user_id' in presence) {
          users.push(presence as unknown as PresenceUser)
        }
      })
    })

    return users
  }

  /**
   * Get current online users count
   */
  getOnlineUsersCount(): number {
    if (!this.channel) return 0

    const state = this.channel.presenceState()
    return this.getPresenceUsers(state).length
  }

  /**
   * Check if channel is subscribed
   */
  isSubscribed(): boolean {
    return this.channel !== null && this.isConnected
  }

  /**
   * Handle reconnection logic
   */
  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached. Stopping reconnection.')
      // 더 이상 재연결 시도하지 않고 정상적으로 종료
      await this.unsubscribe()
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000)

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`)

    this.reconnectTimer = setTimeout(async () => {
      try {
        // Unsubscribe old channel
        if (this.channel) {
          const supabase = getSupabaseClient()
          await supabase.removeChannel(this.channel)
          this.channel = null
        }

        // Re-subscribe
        await this.subscribe()
      } catch (error) {
        console.error('Reconnection failed:', error)
        this.handleReconnect()
      }
    }, delay)
  }

  /**
   * Add connection status listener
   */
  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.add(callback)
    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(callback)
    }
  }

  /**
   * Notify connection listeners
   */
  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected)
      } catch (error) {
        console.error('Error in connection listener:', error)
      }
    })
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  /**
   * Manually trigger reconnection
   */
  async reconnect() {
    this.reconnectAttempts = 0
    await this.handleReconnect()
  }
}