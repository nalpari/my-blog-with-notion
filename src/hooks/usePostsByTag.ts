import { useState, useEffect, useCallback } from 'react'
import type { Post } from '@/types/notion'

interface PostsByTagResponse {
  posts: Post[]
  hasMore: boolean
  nextCursor?: string
}

interface UsePostsByTagResult {
  posts: Post[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * 특정 태그의 포스트를 관리하는 커스텀 훅
 * 
 * @param tagSlug - 태그 슬러그
 * @param postsPerPage - 페이지당 포스트 수 (기본값: 9)
 * @returns {UsePostsByTagResult} 포스트 데이터와 관련 상태, 메서드들
 * 
 * @example
 * ```tsx
 * function TagPostsPage({ tagSlug }) {
 *   const { posts, loading, error, hasMore, loadMore, refresh } = usePostsByTag(tagSlug)
 *   
 *   if (loading && posts.length === 0) return <div>Loading...</div>
 *   if (error) return <div>Error: {error}</div>
 *   
 *   return (
 *     <div>
 *       {posts.map(post => (
 *         <div key={post.id}>{post.title}</div>
 *       ))}
 *       {hasMore && (
 *         <button onClick={loadMore} disabled={loading}>
 *           {loading ? 'Loading...' : 'Load More'}
 *         </button>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePostsByTag(
  tagSlug: string, 
  postsPerPage: number = 9
): UsePostsByTagResult {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)

  /**
   * 포스트 데이터를 API에서 가져오는 함수
   */
  const fetchPosts = useCallback(async (
    cursor?: string, 
    append: boolean = false
  ) => {
    if (!tagSlug) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        tag: tagSlug,
        limit: postsPerPage.toString(),
        ...(cursor && { cursor })
      })

      const response = await fetch(`/api/posts?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PostsByTagResponse = await response.json()
      
      if (append) {
        setPosts(prev => [...prev, ...(data.posts || [])])
      } else {
        setPosts(data.posts || [])
      }
      
      setHasMore(data.hasMore || false)
      setNextCursor(data.nextCursor)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching posts by tag:', err)
      
      if (!append) {
        setPosts([])
        setHasMore(false)
        setNextCursor(undefined)
      }
    } finally {
      setLoading(false)
    }
  }, [tagSlug, postsPerPage])

  /**
   * 더 많은 포스트를 로드하는 함수
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !nextCursor) return
    await fetchPosts(nextCursor, true)
  }, [hasMore, loading, nextCursor, fetchPosts])

  /**
   * 포스트 목록을 새로고침하는 함수
   */
  const refresh = useCallback(async () => {
    setNextCursor(undefined)
    await fetchPosts(undefined, false)
  }, [fetchPosts])

  // 태그 슬러그가 변경되면 포스트 다시 로드
  useEffect(() => {
    setNextCursor(undefined)
    fetchPosts(undefined, false)
  }, [fetchPosts])

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}