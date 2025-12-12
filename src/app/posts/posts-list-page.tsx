'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { Post } from '@/types/notion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PostCard } from '@/components/post-card'
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { POSTS_CONFIG } from '@/config/constants'

// 로딩 컴포넌트
function PostsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border border-border/40 rounded-lg overflow-hidden bg-card/40">
          <div className="aspect-[16/9] bg-muted/50 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-4 w-24 bg-muted/50 animate-pulse rounded" />
            <div className="h-6 w-3/4 bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted/50 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// 페이지네이션 컴포넌트
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNext?: boolean
  hasPrevious?: boolean
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrevious,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    const half = Math.floor(maxVisible / 2)

    let start = Math.max(1, currentPage - half)
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-16">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={hasPrevious !== undefined ? !hasPrevious : currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">이전 페이지</span>
      </Button>

      {getPageNumbers().map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onPageChange(page)}
          className={`h-8 w-8 p-0 text-sm font-medium ${currentPage === page ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={hasNext !== undefined ? !hasNext : currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">다음 페이지</span>
      </Button>
    </div>
  )
}

interface PaginationInfo {
  page: number
  limit: number
  totalPosts: number
  totalPages: number
  hasMore: boolean
  hasNext: boolean
  hasPrevious: boolean
  nextCursor?: string
}

interface ApiResponse {
  posts: Post[]
  pagination: PaginationInfo
  error?: string
}

const getCacheKey = (page: number, search: string, category: string) => {
  return `posts_cache_${page}_${search}_${category}`
}

const getCursorCacheKey = (search: string, category: string) => {
  return `cursor_map_${search}_${category}`
}

const getCachedData = (key: string) => {
  try {
    const cached = sessionStorage.getItem(key)
    if (cached) {
      const data = JSON.parse(cached)
      if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        return data
      }
      sessionStorage.removeItem(key)
    }
  } catch {
    // Ignore
  }
  return null
}

const getCursorMap = (search: string, category: string): Map<number, string> => {
  try {
    const key = getCursorCacheKey(search, category)
    const cached = sessionStorage.getItem(key)
    if (cached) {
      const data = JSON.parse(cached)
      if (Date.now() - data.timestamp < 10 * 60 * 1000) {
        return new Map(data.cursors)
      }
      sessionStorage.removeItem(key)
    }
  } catch {
    // Ignore
  }
  return new Map()
}

const saveCursorMap = (search: string, category: string, cursorMap: Map<number, string>) => {
  try {
    const key = getCursorCacheKey(search, category)
    sessionStorage.setItem(
      key,
      JSON.stringify({
        cursors: Array.from(cursorMap.entries()),
        timestamp: Date.now(),
      }),
    )
  } catch {
    // Ignore
  }
}

const setCachedData = (
  key: string,
  posts: Post[],
  pagination: PaginationInfo,
) => {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        posts,
        pagination,
        timestamp: Date.now(),
      }),
    )
  } catch {
    // Ignore
  }
}

export function PostsListPage() {
  const getInitialState = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return {
        page: parseInt(params.get('page') || '1'),
        search: params.get('q') || '',
        category: params.get('category') || 'all',
      }
    }
    return {
      page: 1,
      search: '',
      category: 'all',
    }
  }

  const initialState = getInitialState()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>(initialState.search)
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialState.category,
  )
  const [currentPage, setCurrentPage] = useState<number>(initialState.page)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: initialState.page,
    limit: POSTS_CONFIG.POSTS_PER_PAGE,
    totalPosts: 0,
    totalPages: 0,
    hasMore: false,
    hasNext: false,
    hasPrevious: false,
  })
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [isInitialMount, setIsInitialMount] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cursorMap, setCursorMap] = useState<Map<number, string>>(new Map())

  const postsPerPage = POSTS_CONFIG.POSTS_PER_PAGE
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchPosts = useCallback(
    async (
      page: number = 1,
      search: string = '',
      category: string = 'all',
      useCache: boolean = true,
    ) => {
      const cacheKey = getCacheKey(page, search, category)
      if (useCache) {
        const cached = getCachedData(cacheKey)
        if (cached) {
          setPosts(cached.posts)
          setPagination(cached.pagination)
          setLoading(false)
          return
        }
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      if (!useCache || !getCachedData(cacheKey)) {
        setLoading(true)
      }
      setError(null)

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: postsPerPage.toString(),
          ...(search && { q: search }),
          ...(category !== 'all' && { category }),
        })

        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          url.searchParams.set('page', page.toString())
          if (search) url.searchParams.set('q', search)
          else url.searchParams.delete('q')
          if (category !== 'all') url.searchParams.set('category', category)
          else url.searchParams.delete('category')
          window.history.replaceState({}, '', url)
        }

        const response = await fetch(`/api/posts?${params}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(
            `서버 응답 오류: ${response.status} ${response.statusText}`,
          )
        }

        const data: ApiResponse = await response.json()

        if (!controller.signal.aborted) {
          setPosts(data.posts)
          setPagination(data.pagination)
          setError(null)

          if (data.pagination.nextCursor && page > 0) {
            const newCursorMap = getCursorMap(search, category)
            newCursorMap.set(page + 1, data.pagination.nextCursor)
            setCursorMap(newCursorMap)
            saveCursorMap(search, category, newCursorMap)
          }

          setCachedData(cacheKey, data.posts, data.pagination)
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : '포스트를 불러오는 중 알 수 없는 오류가 발생했습니다'
        console.error('포스트를 불러오는 중 오류가 발생했습니다:', error)

        if (!controller.signal.aborted) {
          setError(errorMessage)
          setPosts([])
          setPagination({
            page: 1,
            limit: postsPerPage,
            totalPosts: 0,
            totalPages: 0,
            hasMore: false,
            hasNext: false,
            hasPrevious: false,
          })
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    },
    [postsPerPage],
  )

  useEffect(() => {
    const controller = new AbortController()

    const loadCategories = async () => {
      try {
        const cachedCategories = sessionStorage.getItem('categories_cache')
        if (cachedCategories) {
          setAllCategories(JSON.parse(cachedCategories))
          return
        }

        const response = await fetch('/api/posts?limit=100', {
          signal: controller.signal,
        })
        if (response.ok) {
          const data = await response.json()
          const uniqueCategories = Array.from(
            new Set(
              data.posts
                .map((post: Post) => post.category?.name)
                .filter(Boolean),
            ),
          ) as string[]
          setAllCategories(uniqueCategories)
          sessionStorage.setItem(
            'categories_cache',
            JSON.stringify(uniqueCategories),
          )
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        console.error('카테고리 로드 중 오류:', error)
      }
    }

    loadCategories()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (isInitialMount) {
      fetchPosts(currentPage, searchTerm, selectedCategory, true)
      setIsInitialMount(false)
    } else {
      fetchPosts(currentPage, searchTerm, selectedCategory, false)
    }
  }, [currentPage, searchTerm, selectedCategory, fetchPosts, isInitialMount])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    setCursorMap(new Map())
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
    setCursorMap(new Map())
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="py-20 sm:py-24 border-b border-border/40">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              최신 기술 트렌드와 개발 경험을 공유합니다.
            </p>
          </div>
        </div>

        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="포스트 검색..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-10 border-border/60 bg-background/50 focus:bg-background transition-colors"
                />
              </div>

              <div className="flex items-center gap-3">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[160px] h-10 border-border/60 bg-background/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Filter className="w-4 h-4" />
                      <span className="text-foreground">{selectedCategory === 'all' ? '모든 카테고리' : selectedCategory}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 카테고리</SelectItem>
                    {allCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Count Badge */}
                {!loading && (
                  <div className="hidden sm:flex items-center px-3 h-10 rounded-md border border-border/40 bg-muted/20 text-sm text-muted-foreground">
                    {pagination.totalPosts} posts
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-destructive/5 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {loading ? (
              <PostsLoading />
            ) : posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {posts.map((post, index) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      priority={index === 0 && currentPage === 1}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  hasNext={pagination.hasNext}
                  hasPrevious={pagination.hasPrevious}
                />
              </>
            ) : (
              <div className="py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-medium mb-2">포스트를 찾을 수 없습니다</h3>
                <p className="text-muted-foreground mb-6">
                  검색어 또는 필터를 변경하여 다시 시도해보세요.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
