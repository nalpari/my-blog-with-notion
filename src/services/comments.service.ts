import { getSupabaseClient } from '@/lib/supabase/client'
import { CommentWithReplies } from '@/types/supabase'
import { CreateCommentInput } from '@/types/comment'
import { withRetry, CircuitBreaker, RequestQueue } from '@/lib/network/retry-handler'

class CommentsService {
  private static instance: CommentsService
  private circuitBreaker: CircuitBreaker
  private requestQueue: RequestQueue

  private constructor() {
    this.circuitBreaker = new CircuitBreaker()
    this.requestQueue = new RequestQueue(3)
  }

  static getInstance(): CommentsService {
    if (!CommentsService.instance) {
      CommentsService.instance = new CommentsService()
    }
    return CommentsService.instance
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
          const url = new URL('/api/comments', window.location.origin)
          url.searchParams.append('post', postSlug)

          if (options?.limit) {
            url.searchParams.append('limit', options.limit.toString())
          }

          if (options?.cursor) {
            url.searchParams.append('cursor', options.cursor)
          }

          const response = await fetch(url.toString())

          if (!response.ok) {
            const error: any = new Error(`Failed to fetch comments: ${response.statusText}`)
            error.status = response.status
            throw error
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
            const errorData = await response.json()
            const error: any = new Error(errorData.message || 'Failed to create comment')
            error.status = response.status
            throw error
          }

          const result = await response.json()
          return result.data
        },
        {
          maxRetries: 2,
          retryCondition: (error) => {
            // Don't retry client errors (4xx)
            if ((error as any).status && (error as any).status >= 400 && (error as any).status < 500) {
              return false
            }
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
            const errorData = await response.json()
            const error: any = new Error(errorData.message || 'Failed to update comment')
            error.status = response.status
            throw error
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
          const url = new URL('/api/comments', window.location.origin)
          url.searchParams.append('id', commentId)

          const response = await fetch(url.toString(), {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData = await response.json()
            const error: any = new Error(errorData.message || 'Failed to delete comment')
            error.status = response.status
            throw error
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
   */
  async getCommentCounts(postSlugs: string[]): Promise<Map<string, number>> {
    const supabase = getSupabaseClient()
    const counts = new Map<string, number>()

    const { data, error } = await supabase
      .from('comments')
      .select('post_slug')
      .in('post_slug', postSlugs)
      .eq('is_deleted', false)

    if (error) {
      console.error('Error fetching comment counts:', error)
      return counts
    }

    // Count comments per post
    data?.forEach(comment => {
      const current = counts.get(comment.post_slug) || 0
      counts.set(comment.post_slug, current + 1)
    })

    // Set 0 for posts without comments
    postSlugs.forEach(slug => {
      if (!counts.has(slug)) {
        counts.set(slug, 0)
      }
    })

    return counts
  }
}

export const commentsService = CommentsService.getInstance()