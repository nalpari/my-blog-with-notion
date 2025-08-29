import { useState, useEffect, useCallback } from 'react'
import type { Tag } from '@/types/notion'

interface TagsResponse {
  tags: Array<Tag & { count: number }>
  totalTags: number
  totalPosts: number
}

interface UseTagsResult {
  tags: Array<Tag & { count: number }>
  loading: boolean
  error: string | null
  totalTags: number
  totalPosts: number
  refreshTags: () => Promise<void>
}

/**
 * 태그 데이터를 관리하는 커스텀 훅
 * 
 * @returns {UseTagsResult} 태그 데이터와 관련 상태, 메서드들
 * 
 * @example
 * ```tsx
 * function TagsPage() {
 *   const { tags, loading, error, totalTags, totalPosts, refreshTags } = useTags()
 *   
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error}</div>
 *   
 *   return (
 *     <div>
 *       <h1>Tags ({totalTags})</h1>
 *       <p>Total posts: {totalPosts}</p>
 *       {tags.map(tag => (
 *         <div key={tag.id}>{tag.name} ({tag.count})</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useTags(): UseTagsResult {
  const [tags, setTags] = useState<Array<Tag & { count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalTags, setTotalTags] = useState(0)
  const [totalPosts, setTotalPosts] = useState(0)

  /**
   * 태그 데이터를 API에서 가져오는 함수
   */
  const fetchTags = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tags')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: TagsResponse = await response.json()
      
      setTags(data.tags || [])
      setTotalTags(data.totalTags || 0)
      setTotalPosts(data.totalPosts || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching tags:', err)
      
      // 에러 시 초기값으로 리셋
      setTags([])
      setTotalTags(0)
      setTotalPosts(0)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 태그 데이터를 새로고침하는 함수
   * 외부에서 호출 가능
   */
  const refreshTags = useCallback(async () => {
    await fetchTags()
  }, [fetchTags])

  // 컴포넌트 마운트 시 태그 데이터 로드
  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  return {
    tags,
    loading,
    error,
    totalTags,
    totalPosts,
    refreshTags,
  }
}