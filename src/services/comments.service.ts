'use client'

import { getSupabaseClient } from '@/lib/supabase/client'
import { CommentWithReplies } from '@/types/supabase'
import { CreateCommentInput, FetchError, isErrorResponse } from '@/types/comment'
import { withRetry, CircuitBreaker, RequestQueue } from '@/lib/network/retry-handler'

class CommentsService {
  private static instance: CommentsService
  private circuitBreaker: CircuitBreaker
  private requestQueue: RequestQueue
  private baseUrl: string

  private constructor(baseUrl?: string) {
    this.circuitBreaker = new CircuitBreaker()
    this.requestQueue = new RequestQueue(3)
    // SSR-safe: accept injected baseUrl or use window.location if available
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  }

  static getInstance(baseUrl?: string): CommentsService {
    if (!CommentsService.instance) {
      CommentsService.instance = new CommentsService(baseUrl)
    }
    return CommentsService.instance
  }

  /**
   * Helper to get the base URL for API calls
   */
  private getApiUrl(path: string): string {
    if (!this.baseUrl && typeof window === 'undefined') {
      throw new Error('Base URL is required for SSR context')
    }
    const base = this.baseUrl || window.location.origin
    return new URL(path, base).toString()
  }

  /**
   * 댓글 목록 조회
   */
  async fetchComments(
    postSlug: string,
    options?: {
      limit?: number
      cursor?: string
    }
  ) {
    return this.circuitBreaker.execute(
      () => withRetry(
        async () => {
          const url = new URL(this.getApiUrl('/api/comments'))
          url.searchParams.append('post', postSlug)

          if (options?.limit) {
            url.searchParams.append('limit', options.limit.toString())
          }

          if (options?.cursor) {
            url.searchParams.append('cursor', options.cursor)
          }

          const response = await fetch(url.toString())

          if (!response.ok) {
            throw new FetchError(
              `Failed to fetch comments: ${response.statusText}`,
              response.status,
              response.statusText
            )
          }

          return response.json()
        },
        {
          maxRetries: 3,
          onRetry: (attempt, error) => {
            console.log(`Retrying fetch comments (attempt ${attempt}):`, error.message)
          }
        }
      ),
      // Fallback: return empty result
      () => ({ comments: [], hasMore: false, cursor: null })
    )
  }

  /**
   * 댓글 작성
   */
  async createComment(input: CreateCommentInput): Promise<CommentWithReplies> {
    return this.requestQueue.add(() =>
      withRetry(
        async () => {
          const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          })

          if (!response.ok) {
            const errorData: unknown = await response.json()
            let message = 'Failed to create comment'

            if (isErrorResponse(errorData)) {
              message = errorData.message
            }

            throw new FetchError(
              message,
              response.status,
              response.statusText
            )
          }

          const result = await response.json()
          return result.data
        },
        {
          maxRetries: 2,
          retryCondition: (error) => {
            // Don't retry client errors (4xx)
            if (FetchError.isFetchError(error)) {
              return !(error.status >= 400 && error.status < 500)
            }
            // Retry other errors
            return true
          },
          onRetry: (attempt, error) => {
            console.log(`Retrying create comment (attempt ${attempt}):`, error.message)
          }
        }
      )
    )
  }

  /**
   * 댓글 수정
   */
  async updateComment(commentId: string, content: string): Promise<CommentWithReplies> {
    return this.requestQueue.add(() =>
      withRetry(
        async () => {
          const response = await fetch(`/api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
          })

          if (!response.ok) {
            const errorData: unknown = await response.json()
            let message = 'Failed to update comment'

            if (isErrorResponse(errorData)) {
              message = errorData.message
            }

            throw new FetchError(
              message,
              response.status,
              response.statusText
            )
          }

          const result = await response.json()
          return result.data
        },
        {
          maxRetries: 2,
          onRetry: (attempt, error) => {
            console.log(`Retrying update comment (attempt ${attempt}):`, error.message)
          }
        }
      )
    )
  }

  /**
   * 댓글 삭제
   */
  async deleteComment(commentId: string): Promise<{ deletedIds: string[] }> {
    return this.requestQueue.add(() =>
      withRetry(
        async () => {
          const url = new URL(this.getApiUrl('/api/comments'))
          url.searchParams.append('id', commentId)

          const response = await fetch(url.toString(), {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData: unknown = await response.json()
            let message = 'Failed to delete comment'

            if (isErrorResponse(errorData)) {
              message = errorData.message
            }

            throw new FetchError(
              message,
              response.status,
              response.statusText
            )
          }

          const result = await response.json()
          return { deletedIds: result.deletedIds || [commentId] }
        },
        {
          maxRetries: 2,
          onRetry: (attempt, error) => {
            console.log(`Retrying delete comment (attempt ${attempt}):`, error.message)
          }
        }
      )
    )
  }

  /**
   * 댓글 수 가져오기
   */
  async getCommentCount(postSlug: string): Promise<number> {
    const supabase = getSupabaseClient()

    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', postSlug)
      .eq('is_deleted', false)

    if (error) {
      console.error('Error fetching comment count:', error)
      return 0
    }

    return count || 0
  }

  /**
   * 여러 포스트의 댓글 수 가져오기
   * Optimized to fetch counts individually per post using Supabase count
   */
  async getCommentCounts(postSlugs: string[]): Promise<Map<string, number>> {
    const supabase = getSupabaseClient()
    const counts = new Map<string, number>()

    // Since Supabase doesn't support GROUP BY in the client library directly,
    // we'll use Promise.all to fetch counts for each slug efficiently
    const countPromises = postSlugs.map(async (slug) => {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true }) // head: true returns only count, not rows
        .eq('post_slug', slug)
        .eq('is_deleted', false)

      if (error) {
        console.error(`Error fetching count for ${slug}:`, error)
        return { slug, count: 0 }
      }

      return { slug, count: count || 0 }
    })

    try {
      // Execute all count queries in parallel for efficiency
      const results = await Promise.all(countPromises)

      // Map results to the counts Map
      results.forEach(({ slug, count }) => {
        counts.set(slug, count)
      })
    } catch (error) {
      console.error('Error fetching comment counts:', error)
      // On error, set all slugs to 0
      postSlugs.forEach(slug => {
        counts.set(slug, 0)
      })
    }

    return counts
  }
}

export const commentsService = CommentsService.getInstance()