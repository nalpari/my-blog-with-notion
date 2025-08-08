'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

import Link from 'next/link'
import Image from 'next/image'
import type { Post, NotionDatabaseResponse } from '@/types/notion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TagList } from '@/components/ui/tag-badge'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

// 포스트 카드 컴포넌트 (기존과 동일)
function PostCard({ post }: { post: Post }) {
	const formatDate = (dateString: string) => {
		return new Date(dateString)
			.toLocaleDateString('ko-KR', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			})
			.replace(/\. /g, '.')
			.replace(/\.$/, '')
	}

	return (
		<Link href={`/posts/${post.slug}`}>
			<Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden p-0 cursor-pointer h-full">
				{post.coverImage && (
					<div className="relative h-48 w-full overflow-hidden">
						<Image
							src={post.coverImage}
							alt={post.title}
							fill
							className="object-cover group-hover:scale-105 transition-transform duration-300"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						/>
					</div>
				)}
				{!post.coverImage && (
					<div className="relative h-48 w-full overflow-hidden bg-muted flex items-center justify-center">
						<div className="text-muted-foreground">
							<svg
								className="w-12 h-12"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
					</div>
				)}
				<CardHeader className="p-6 pb-4">
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
						<span>{formatDate(post.publishedAt)}</span>
						{post.category && (
							<>
								<span>•</span>
								<span className="bg-accent/10 text-accent px-2 py-1 rounded-md text-xs font-medium">
									{post.category.name}
								</span>
							</>
						)}
					</div>
					<CardTitle className="text-lg group-hover:text-accent transition-colors line-clamp-2 overflow-hidden text-ellipsis">
						{post.title}
					</CardTitle>
					{post.tags && post.tags.length > 0 && (
						<div className="mt-2">
							<TagList tags={post.tags} maxTags={3} size="sm" />
						</div>
					)}
					<CardDescription className="line-clamp-3 mt-2">
						{post.excerpt}
					</CardDescription>
				</CardHeader>
				<CardContent className="px-6 pb-6">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">
							{post.readingTime}분 읽기
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="text-accent hover:text-white hover:bg-accent"
						>
							읽기 →
						</Button>
					</div>
				</CardContent>
			</Card>
		</Link>
	)
}

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
function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}) {
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
				disabled={currentPage === 1}
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
				disabled={currentPage === totalPages}
				className="gap-1"
			>
				다음
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	)
}

export function PostsListPage() {
	const [posts, setPosts] = useState<Post[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState<string>('all')
	const [currentPage, setCurrentPage] = useState(1)


	const postsPerPage = 9

	// 포스트 데이터 가져오기
	useEffect(() => {
		const fetchPosts = async () => {
			setLoading(true)
			try {
				const response = await fetch('/api/posts?limit=100')
				if (!response.ok) {
					throw new Error('Failed to fetch posts')
				}
				const data: NotionDatabaseResponse = await response.json()
				setPosts(data.posts)
			} catch (error) {
				console.error('포스트를 불러오는 중 오류가 발생했습니다:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchPosts()
	}, [])

	// 필터링된 포스트
	const filteredPosts = useMemo(() => {
		return posts.filter((post) => {
			const matchesSearch =
				searchTerm === '' ||
				post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())

			const matchesCategory =
				selectedCategory === 'all' ||
				post.category?.name === selectedCategory

			return matchesSearch && matchesCategory
		})
	}, [posts, searchTerm, selectedCategory])

	// 페이지네이션된 포스트
	const paginatedPosts = useMemo(() => {
		const startIndex = (currentPage - 1) * postsPerPage
		const endIndex = startIndex + postsPerPage
		return filteredPosts.slice(startIndex, endIndex)
	}, [filteredPosts, currentPage, postsPerPage])

	// 총 페이지 수
	const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

	// 카테고리 목록
	const categories = useMemo(() => {
		const uniqueCategories = Array.from(
			new Set(posts.map((post) => post.category?.name).filter(Boolean))
		)
		return uniqueCategories
	}, [posts])

	// 검색어 변경 시 첫 페이지로 이동
	useEffect(() => {
		setCurrentPage(1)
	}, [searchTerm, selectedCategory])

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: 'smooth' })
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
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<Select value={selectedCategory} onValueChange={setSelectedCategory}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="카테고리 선택" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">모든 카테고리</SelectItem>
									{categories.map((category) => (
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
								총 {filteredPosts.length}개의 포스트
								{searchTerm && (
								<span> ('{searchTerm}' 검색 결과)</span>
							)}
							</p>
						</div>
					)}

					{/* 포스트 목록 */}
					{loading ? (
						<PostsLoading />
					) : paginatedPosts.length > 0 ? (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{paginatedPosts.map((post) => (
									<PostCard key={post.id} post={post} />
								))}
							</div>
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={handlePageChange}
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