import { useState, useEffect, useCallback, useRef } from 'react'
import type { Post } from '@/types/notion'
import { API_CONFIG, POSTS_CONFIG, FILTER_CONFIG } from '@/config/constants'

interface UsePostsResult {
  posts: Post[]
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
    totalPosts: number
  }
  fetchPosts: (page?: number, search?: string, category?: string) => Promise<void>
  setCurrentPage: (page: number) => void
}

export function usePosts(): UsePostsResult {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    totalPosts: 0,
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchPosts = useCallback(async (
    page: number = 1,
    search: string = FILTER_CONFIG.DEFAULT_SEARCH,
    category: string = FILTER_CONFIG.ALL_CATEGORIES
  ) => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: POSTS_CONFIG.POSTS_PER_PAGE.toString(),
        ...(search && { q: search }),
        ...(category !== FILTER_CONFIG.ALL_CATEGORIES && { category })
      })

      const response = await fetch(`${API_CONFIG.POSTS_ENDPOINT}?${params}`, {
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      setPosts(data.posts || [])
      setPagination({
        currentPage: page,
        totalPages: data.pagination?.totalPages || 1,
        hasNext: data.pagination?.hasNext || false,
        hasPrevious: page > 1,
        totalPosts: data.pagination?.totalPosts || 0,
      })
    } catch (err) {
      if (err instanceof Error) {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setPosts([])
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 클린업
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const setCurrentPage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  return {
    posts,
    loading,
    error,
    pagination,
    fetchPosts,
    setCurrentPage,
  }
}