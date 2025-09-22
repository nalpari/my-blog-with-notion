import { CommentWithReplies } from '@/types/supabase'

/**
 * Helper for optimistic comment operations
 */
export class OptimisticCommentUpdater {
  /**
   * Add a new comment optimistically
   */
  static addComment(
    comments: CommentWithReplies[],
    newComment: CommentWithReplies
  ): CommentWithReplies[] {
    if (newComment.parent_id) {
      // Add reply to parent comment
      return comments.map(comment => {
        if (comment.id === newComment.parent_id) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment]
          }
        }

        // Check nested replies
        if (comment.replies?.length) {
          return {
            ...comment,
            replies: this.addComment(comment.replies, newComment)
          }
        }

        return comment
      })
    }

    // Add top-level comment
    return [newComment, ...comments]
  }

  /**
   * Update a comment optimistically
   */
  static updateComment(
    comments: CommentWithReplies[],
    updatedComment: Partial<CommentWithReplies> & { id: string }
  ): CommentWithReplies[] {
    return comments.map(comment => {
      if (comment.id === updatedComment.id) {
        return { ...comment, ...updatedComment, is_edited: true }
      }

      // Check nested replies
      if (comment.replies?.length) {
        return {
          ...comment,
          replies: this.updateComment(comment.replies, updatedComment)
        }
      }

      return comment
    })
  }

  /**
   * Delete a comment optimistically
   */
  static deleteComment(
    comments: CommentWithReplies[],
    commentId: string
  ): CommentWithReplies[] {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          is_deleted: true,
          content: '[This comment has been deleted]',
          deleted_at: new Date().toISOString()
        }
      }

      // Check nested replies
      if (comment.replies?.length) {
        return {
          ...comment,
          replies: this.deleteComment(comment.replies, commentId)
        }
      }

      return comment
    })
  }

  /**
   * Create optimistic comment object
   */
  static createOptimisticComment(
    content: string,
    user?: {
      id: string
      email?: string | null
      user_metadata?: {
        name?: string
        avatar_url?: string
      }
    },
    parentId?: string | null
  ): CommentWithReplies {
    const now = new Date().toISOString()

    return {
      id: `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      post_slug: '',  // Will be set by the actual API
      parent_id: parentId || null,
      user_id: user?.id || null,
      user_email: user?.email || null,
      user_name: user?.user_metadata?.name || 'Anonymous',
      user_avatar: user?.user_metadata?.avatar_url || null,
      content,
      is_edited: false,
      is_deleted: false,
      deleted_at: null,
      created_at: now,
      updated_at: now,
      replies: []
    }
  }

  /**
   * Replace optimistic comment with real comment
   */
  static replaceOptimisticComment(
    comments: CommentWithReplies[],
    optimisticId: string,
    realComment: CommentWithReplies
  ): CommentWithReplies[] {
    return comments.map(comment => {
      if (comment.id === optimisticId) {
        return { ...realComment, replies: comment.replies }
      }

      // Check nested replies
      if (comment.replies?.length) {
        return {
          ...comment,
          replies: this.replaceOptimisticComment(comment.replies, optimisticId, realComment)
        }
      }

      return comment
    })
  }

  /**
   * Remove optimistic comment (on error)
   */
  static removeOptimisticComment(
    comments: CommentWithReplies[],
    optimisticId: string
  ): CommentWithReplies[] {
    // Filter out the optimistic comment
    const filtered = comments.filter(comment => comment.id !== optimisticId)

    // Also check nested replies
    return filtered.map(comment => {
      if (comment.replies?.length) {
        return {
          ...comment,
          replies: this.removeOptimisticComment(comment.replies, optimisticId)
        }
      }
      return comment
    })
  }

  /**
   * Count total comments (excluding deleted)
   */
  static countComments(comments: CommentWithReplies[]): number {
    return comments.reduce((count, comment) => {
      if (comment.is_deleted) return count

      const repliesCount = comment.replies
        ? this.countComments(comment.replies)
        : 0

      return count + 1 + repliesCount
    }, 0)
  }

  /**
   * Find comment by ID
   */
  static findComment(
    comments: CommentWithReplies[],
    commentId: string
  ): CommentWithReplies | null {
    for (const comment of comments) {
      if (comment.id === commentId) {
        return comment
      }

      if (comment.replies?.length) {
        const found = this.findComment(comment.replies, commentId)
        if (found) return found
      }
    }

    return null
  }
}