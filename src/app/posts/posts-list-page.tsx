'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardContent,
	CardHeader,
} from '@/components/ui/card'
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
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { POSTS_CONFIG, PAGINATION_CONFIG, FILTER_CONFIG } from '@/config/constants'

// 로딩 컴포넌트
function PostsLoading() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
				<Card key={i} className="overflow-hidden p-0">
					<div className="relative h-48 w-full bg-muted animate-pulse" />
					<CardHeader className="p-6 pb-4">
						<div className="flex items-center gap-2 mb-3">
							<div className="h-4 w-20 bg-muted animate-pulse rounded" />
							<span>•</span>
							<div className="h-6 w-16 bg-muted animate-pulse rounded" />
						</div>
						<div className="h-6 w-full bg-muted animate-pulse rounded mb-2" />
						<div className="h-4 w-full bg-muted animate-pulse rounded" />
						<div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
					</CardHeader>
					<CardContent className="px-6 pb-6">
						<div className="flex items-center justify-between">
							<div className="h-4 w-16 bg-muted animate-pulse rounded" />
							<div className="h-8 w-16 bg-muted animate-pulse rounded" />
						</div>
					</CardContent>
				</Card>
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
		<div className="flex items-center justify-center gap-2 mt-12">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={hasPrevious !== undefined ? !hasPrevious : currentPage === 1}
				className="gap-1"
			>
				<ChevronLeft className="h-4 w-4" />
				이전
			</Button>

			{getPageNumbers().map((page) => (
				<Button
					key={page}
					variant={currentPage === page ? 'default' : 'outline'}
					size="sm"
					onClick={() => onPageChange(page)}
					className="min-w-[40px]"
				>
					{page}
				</Button>
			))}

			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={hasNext !== undefined ? !hasNext : currentPage === totalPages}
				className="gap-1"
			>
				다음
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
}

interface ApiResponse {
	posts: Post[]
	pagination: PaginationInfo
	error?: string
}

export function PostsListPage() {
	const [posts, setPosts] = useState<Post[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState<string>(FILTER_CONFIG.DEFAULT_SEARCH)
	const [selectedCategory, setSelectedCategory] = useState<string>(FILTER_CONFIG.ALL_CATEGORIES)
	const [currentPage, setCurrentPage] = useState<number>(PAGINATION_CONFIG.INITIAL_PAGE)
	const [pagination, setPagination] = useState<PaginationInfo>({
		page: PAGINATION_CONFIG.INITIAL_PAGE,
		limit: POSTS_CONFIG.POSTS_PER_PAGE,
		totalPosts: 0,
		totalPages: 0,
		hasMore: false,
		hasNext: false,
		hasPrevious: false
	})
	const [allCategories, setAllCategories] = useState<string[]>([])

	const postsPerPage = POSTS_CONFIG.POSTS_PER_PAGE
	const abortControllerRef = useRef<AbortController | null>(null)

	// Fetch posts with query parameters
	const fetchPosts = useCallback(async (
		page: number = 1,
		search: string = '',
		category: string = 'all'
	) => {
		// 이전 요청이 있으면 취소
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

		// 새로운 AbortController 생성
		const controller = new AbortController()
		abortControllerRef.current = controller

		setLoading(true)
		setError(null) // Clear previous errors
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: postsPerPage.toString(),
				...(search && { q: search }),
				...(category !== 'all' && { category })
			})

			const response = await fetch(`/api/posts?${params}`, {
				signal: controller.signal
			})
			
			if (!response.ok) {
				throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`)
			}
			
			const data: ApiResponse = await response.json()
			
			// 요청이 취소되지 않았을 때만 상태 업데이트
			if (!controller.signal.aborted) {
				setPosts(data.posts)
				setPagination(data.pagination)
				setError(null) // Clear error on success
			}
		} catch (error) {
			// AbortError는 무시 (사용자가 의도적으로 취소한 경우)
			if (error instanceof Error && error.name === 'AbortError') {
				console.log('요청이 취소되었습니다')
				return
			}
			
			const errorMessage = error instanceof Error 
				? error.message 
				: '포스트를 불러오는 중 알 수 없는 오류가 발생했습니다';
			console.error('포스트를 불러오는 중 오류가 발생했습니다:', error)
			
			// 요청이 취소되지 않았을 때만 에러 상태 업데이트
			if (!controller.signal.aborted) {
				setError(errorMessage)
				setPosts([])
				setPagination({
					page: 1,
					limit: 9,
					totalPosts: 0,
					totalPages: 0,
					hasMore: false,
					hasNext: false,
					hasPrevious: false
				})
			}
		} finally {
			// 요청이 취소되지 않았을 때만 로딩 상태 업데이트
			if (!controller.signal.aborted) {
				setLoading(false)
			}
		}
	}, [postsPerPage])

	// Initial load to get all categories
	useEffect(() => {
		const controller = new AbortController()
		
		const loadInitialData = async () => {
			try {
				// Fetch all posts once to get categories
				const response = await fetch('/api/posts?limit=100', {
					signal: controller.signal
				})
				if (response.ok) {
					const data = await response.json()
					const uniqueCategories = Array.from(
						new Set(data.posts.map((post: Post) => post.category?.name).filter(Boolean))
					) as string[]
					setAllCategories(uniqueCategories)
				}
			} catch (error) {
				// AbortError는 무시
				if (error instanceof Error && error.name === 'AbortError') {
					return
				}
				console.error('카테고리 로드 중 오류:', error)
			}
			
			// Fetch first page
			fetchPosts(1, '', 'all')
		}

		loadInitialData()

		// cleanup 함수에서 요청 취소
		return () => {
			controller.abort()
		}
	}, [fetchPosts])

	// Fetch posts when search, category, or page changes
	useEffect(() => {
		fetchPosts(currentPage, searchTerm, selectedCategory)
	}, [currentPage, searchTerm, selectedCategory, fetchPosts])

	// Reset to first page when search or category changes
	useEffect(() => {
		if (currentPage !== 1 && (searchTerm || selectedCategory !== 'all')) {
			setCurrentPage(1)
		}
	}, [searchTerm, selectedCategory, currentPage])

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
		if (currentPage !== 1) {
			setCurrentPage(1)
		}
	}

	const handleCategoryChange = (value: string) => {
		setSelectedCategory(value)
		if (currentPage !== 1) {
			setCurrentPage(1)
		}
	}

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<section className="py-12 sm:py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					{/* 헤더 */}
					<div className="mb-8 sm:mb-12">
						<h1 className="text-3xl sm:text-4xl font-bold mb-4">모든 포스트</h1>
						<p className="text-muted-foreground text-base sm:text-lg">
							개발과 기술에 대한 모든 인사이트를 확인해보세요
						</p>
					</div>

					{/* 검색 및 필터 */}
					<div className="mb-8 flex flex-col sm:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								type="text"
								placeholder="포스트 제목이나 내용으로 검색..."
								value={searchTerm}
								onChange={(e) => handleSearchChange(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<Select value={selectedCategory} onValueChange={handleCategoryChange}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="카테고리 선택" />
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

					{/* 결과 카운트 */}
					{!loading && (
						<div className="mb-6">
							<p className="text-sm text-muted-foreground">
								총 {pagination.totalPosts}개의 포스트
								{searchTerm && (
								<span> (&apos;{searchTerm}&apos; 검색 결과)</span>
							)}
							</p>
						</div>
					)}

					{/* 에러 메시지 표시 */}
					{error && (
						<div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
							<p className="text-destructive font-medium">오류가 발생했습니다</p>
							<p className="text-sm text-destructive/80 mt-1">{error}</p>
						</div>
					)}

					{/* 포스트 목록 */}
					{loading ? (
						<PostsLoading />
					) : error ? (
						<div className="text-center py-12">
							<div className="text-muted-foreground mb-4">
								<svg
									className="w-16 h-16 mx-auto mb-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold mb-2">포스트를 불러올 수 없습니다</h3>
							<p className="text-muted-foreground mb-4">
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
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{posts.map((post) => (
									<PostCard key={post.id} post={post} />
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
						<div className="text-center py-12">
							<div className="text-muted-foreground mb-4">
								<svg
									className="w-16 h-16 mx-auto mb-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							{searchTerm || selectedCategory !== 'all' ? (
								<>
									<h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
									<p className="text-muted-foreground mb-4">
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
									<h3 className="text-lg font-semibold mb-2">아직 게시된 포스트가 없습니다</h3>
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