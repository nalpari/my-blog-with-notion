'use client'

import { CommentWithReplies } from '@/types/supabase'

interface CacheEntry {
  data: CommentWithReplies[]
  timestamp: number
  cursor: string | null
  hasMore: boolean
}

class CommentCache {
  private cache: Map<string, CacheEntry>
  private readonly TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_ENTRIES = 50

  constructor() {
    this.cache = new Map()
  }

  // Get cached comments for a post
  get(postSlug: string): CacheEntry | null {
    const entry = this.cache.get(postSlug)

    if (!entry) {
      return null
    }

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(postSlug)
      return null
    }

    return entry
  }

  // Set comments in cache
  set(postSlug: string, data: CommentWithReplies[], cursor: string | null, hasMore: boolean): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_ENTRIES) {
      const oldestKey = this.findOldestEntry()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(postSlug, {
      data,
      timestamp: Date.now(),
      cursor,
      hasMore,
    })
  }

  // Update a specific comment in cache
  updateComment(postSlug: string, updatedComment: CommentWithReplies): void {
    const entry = this.cache.get(postSlug)
    if (!entry) return

    const updateCommentInTree = (comments: CommentWithReplies[]): CommentWithReplies[] => {
      return comments.map(comment => {
        if (comment.id === updatedComment.id) {
          return updatedComment
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateCommentInTree(comment.replies)
          }
        }
        return comment
      })
    }

    entry.data = updateCommentInTree(entry.data)
    entry.timestamp = Date.now() // Refresh timestamp
  }

  // Add a new comment to cache
  addComment(postSlug: string, newComment: CommentWithReplies): void {
    const entry = this.cache.get(postSlug)
    if (!entry) return

    if (newComment.parent_id) {
      // Add reply to parent comment
      const addReplyToTree = (comments: CommentWithReplies[]): CommentWithReplies[] => {
        return comments.map(comment => {
          if (comment.id === newComment.parent_id) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            }
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: addReplyToTree(comment.replies)
            }
          }
          return comment
        })
      }
      entry.data = addReplyToTree(entry.data)
    } else {
      // Add new top-level comment
      entry.data = [newComment, ...entry.data]
    }

    entry.timestamp = Date.now() // Refresh timestamp
  }

  // Delete a comment from cache
  deleteComment(postSlug: string, commentId: string): void {
    const entry = this.cache.get(postSlug)
    if (!entry) return

    const markAsDeleted = (comments: CommentWithReplies[]): CommentWithReplies[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_deleted: true,
            content: '[This comment has been deleted]'
          }
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: markAsDeleted(comment.replies)
          }
        }
        return comment
      })
    }

    entry.data = markAsDeleted(entry.data)
    entry.timestamp = Date.now() // Refresh timestamp
  }

  // Invalidate cache for a post
  invalidate(postSlug: string): void {
    this.cache.delete(postSlug)
  }

  // Clear entire cache
  clear(): void {
    this.cache.clear()
  }

  // Find oldest cache entry for LRU eviction
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_ENTRIES,
      ttl: this.TTL,
      entries: Array.from(this.cache.keys()),
    }
  }
}

// Export singleton instance
export const commentCache = new CommentCache()