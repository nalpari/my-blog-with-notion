'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { POSTS_CONFIG } from '@/config/constants'

// 로딩 컴포넌트
function PostsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          <div className="aspect-[16/10] bg-muted animate-shimmer" />
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 bg-muted animate-shimmer rounded-lg" />
              <div className="h-4 w-16 bg-muted animate-shimmer rounded-lg" />
            </div>
            <div className="h-6 w-full bg-muted animate-shimmer rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-shimmer rounded-lg" />
              <div className="h-4 w-3/4 bg-muted animate-shimmer rounded-lg" />
            </div>
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
    // 전체 페이지 번호를 모두 반환
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-16">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={hasPrevious !== undefined ? !hasPrevious : currentPage === 1}
        className="gap-1.5"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">이전</span>
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(page)}
            className="min-w-[40px]"
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={hasNext !== undefined ? !hasNext : currentPage === totalPages}
        className="gap-1.5"
      >
        <span className="hidden sm:inline">다음</span>
        <ChevronRight className="h-4 w-4" />
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

// 캐시 키 생성 함수
const getCacheKey = (page: number, search: string, category: string) => {
  return `posts_cache_${page}_${search}_${category}`
}

// 커서 캐시 키 생성 함수
const getCursorCacheKey = (search: string, category: string) => {
  return `cursor_map_${search}_${category}`
}

// sessionStorage에서 캐시된 데이터 가져오기
const getCachedData = (key: string) => {
  try {
    const cached = sessionStorage.getItem(key)
    if (cached) {
      const data = JSON.parse(cached)
      // 캐시 유효 시간: 5분
      if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        return data
      }
      sessionStorage.removeItem(key)
    }
  } catch {
    // 캐시 읽기 실패 시 무시
  }
  return null
}

// 커서 매핑 정보 가져오기
const getCursorMap = (
  search: string,
  category: string,
): Map<number, string> => {
  try {
    const key = getCursorCacheKey(search, category)
    const cached = sessionStorage.getItem(key)
    if (cached) {
      const data = JSON.parse(cached)
      // 캐시 유효 시간: 10분 (API와 동일)
      if (Date.now() - data.timestamp < 10 * 60 * 1000) {
        return new Map(data.cursors)
      }
      sessionStorage.removeItem(key)
    }
  } catch {
    // 캐시 읽기 실패 시 무시
  }
  return new Map()
}

// 커서 매핑 정보 저장
const saveCursorMap = (
  search: string,
  category: string,
  cursorMap: Map<number, string>,
) => {
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
    // 캐시 저장 실패 시 무시
  }
}

// sessionStorage에 데이터 캐싱
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
    // 캐시 저장 실패 시 무시 (용량 초과 등)
  }
}

export function PostsListPage() {
  // URL 파라미터에서 초기값 복원
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

  // Fetch posts with query parameters
  const fetchPosts = useCallback(
    async (
      page: number = 1,
      search: string = '',
      category: string = 'all',
      useCache: boolean = true,
    ) => {
      // 캐시 확인
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

      // 이전 요청이 있으면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // 새로운 AbortController 생성
      const controller = new AbortController()
      abortControllerRef.current = controller

      // 캐시가 없을 때만 로딩 표시
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

        // URL 파라미터 업데이트 (브라우저 히스토리에 저장)
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

        // 요청이 취소되지 않았을 때만 상태 업데이트
        if (!controller.signal.aborted) {
          setPosts(data.posts)
          setPagination(data.pagination)
          setError(null)

          // 커서 정보 업데이트
          if (data.pagination.nextCursor && page > 0) {
            const newCursorMap = getCursorMap(search, category)
            // 다음 페이지를 위한 커서 저장
            newCursorMap.set(page + 1, data.pagination.nextCursor)
            setCursorMap(newCursorMap)
            saveCursorMap(search, category, newCursorMap)
          }

          // 데이터 캐싱
          setCachedData(cacheKey, data.posts, data.pagination)
        }
      } catch (error) {
        // AbortError는 무시
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

  // 카테고리 로드 (한 번만)
  useEffect(() => {
    const controller = new AbortController()

    const loadCategories = async () => {
      try {
        // 캐시된 카테고리 확인
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
          // 카테고리 캐싱
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

  // 초기 로드 및 상태 변경 시 데이터 페칭
  useEffect(() => {
    if (isInitialMount) {
      // 초기 마운트 시 캐시 사용
      fetchPosts(currentPage, searchTerm, selectedCategory, true)
      setIsInitialMount(false)
    } else {
      // 상태 변경 시 새 데이터 로드
      fetchPosts(currentPage, searchTerm, selectedCategory, false)
    }
  }, [currentPage, searchTerm, selectedCategory, fetchPosts, isInitialMount])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 진행 중인 요청 취소
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
    // 검색어 변경 시 커서 맵 초기화
    setCursorMap(new Map())
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
    // 카테고리 변경 시 커서 맵 초기화
    setCursorMap(new Map())
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 border-b border-border/50">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />
        </div>
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              모든 포스트
            </h1>
            <p className="text-lg text-muted-foreground">
              개발과 기술에 대한 모든 인사이트를 확인해보세요
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b border-border/50 bg-muted/20 sticky top-[72px] z-40 backdrop-blur-xl">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* 검색 */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="포스트 검색..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-background border-border/50"
              />
            </div>

            {/* 필터 및 카운트 */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {!loading && (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {pagination.totalPosts}개의 포스트
                </span>
              )}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-[160px] h-11 rounded-xl bg-background border-border/50">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 카테고리</SelectItem>
                    {allCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-destructive font-medium">
                오류가 발생했습니다
              </p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          )}

          {/* 포스트 목록 */}
          {loading ? (
            <PostsLoading />
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <FileText className="w-10 h-10 text-destructive/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                포스트를 불러올 수 없습니다
              </h3>
              <p className="text-muted-foreground mb-6">
                잠시 후 다시 시도해주세요.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setError(null)
                  fetchPosts(currentPage, searchTerm, selectedCategory)
                }}
              >
                다시 시도
              </Button>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {posts.map((post, index) => (
                  <div
                    key={post.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <PostCard
                      post={post}
                      priority={index < 3 && currentPage === 1}
                    />
                  </div>
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
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                <FileText className="w-10 h-10 text-muted-foreground/50" />
              </div>
              {searchTerm || selectedCategory !== 'all' ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    다른 검색어나 카테고리를 시도해보세요.
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
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">
                    아직 게시된 포스트가 없습니다
                  </h3>
                  <p className="text-muted-foreground">
                    곧 흥미로운 포스트들을 만나보실 수 있습니다.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
