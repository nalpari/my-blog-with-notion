import { NextRequest, NextResponse } from 'next/server'
import { getPublishedPosts, getPostsByTag } from '@/lib/notion'

// 페이지-커서 매핑을 위한 메모리 캐시
// key: "search:category:tag:page" -> value: { cursor: string, timestamp: number }
const cursorCache = new Map<string, { cursor: string | undefined; timestamp: number }>()

// 캐시 TTL: 10분
const CACHE_TTL = 10 * 60 * 1000

// 캐시 키 생성 함수
function getCacheKey(search: string, category: string, tag: string, page: number): string {
	return `${search}:${category || 'all'}:${tag || 'none'}:${page}`
}

// 만료된 캐시 항목 정리
function cleanExpiredCache() {
	const now = Date.now()
	for (const [key, value] of cursorCache.entries()) {
		if (now - value.timestamp > CACHE_TTL) {
			cursorCache.delete(key)
		}
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		
		// Parse pagination parameters
		const limitParam = searchParams.get('limit') || '9'
		let limit = parseInt(limitParam)
		if (isNaN(limit) || limit < 1) {
			limit = 9
		} else if (limit > 100) {
			limit = 100
		}
		
		// Parse page number for cursor-based pagination
		const pageParam = searchParams.get('page') || '1'
		const page = Math.max(1, parseInt(pageParam) || 1)
		
		// Parse search query
		const searchQuery = searchParams.get('q') || ''
		
		// Parse category filter
		const category = searchParams.get('category') || undefined
		
		// Parse tag filter
		const tag = searchParams.get('tag') || undefined
		
		// 주기적으로 만료된 캐시 정리
		cleanExpiredCache()
		
		// 페이지별 커서 처리
		let cursor: string | undefined = undefined
		
		if (page > 1) {
			// 2페이지 이상인 경우, 이전 페이지들의 커서를 순차적으로 가져와야 함
			// 먼저 캐시에서 현재 페이지의 커서를 찾아봄
			const cacheKey = getCacheKey(searchQuery, category || '', tag || '', page)
			const cachedCursor = cursorCache.get(cacheKey)
			
			if (cachedCursor && Date.now() - cachedCursor.timestamp < CACHE_TTL) {
				cursor = cachedCursor.cursor
			} else {
				// 캐시가 없으면 1페이지부터 순차적으로 요청해서 커서를 구축
				let tempCursor: string | undefined = undefined
				
				for (let i = 1; i < page; i++) {
					const tempCacheKey = getCacheKey(searchQuery, category || '', tag || '', i)
					const tempCached = cursorCache.get(tempCacheKey)
					
					if (tempCached && Date.now() - tempCached.timestamp < CACHE_TTL) {
						tempCursor = tempCached.cursor
						
						// 다음 페이지 캐시 확인
						const nextCacheKey = getCacheKey(searchQuery, category || '', tag || '', i + 1)
						const nextCached = cursorCache.get(nextCacheKey)
						
						if (nextCached && Date.now() - nextCached.timestamp < CACHE_TTL) {
							// 다음 페이지 캐시가 있으면 계속
							continue
						}
					} else {
						// 캐시가 없으면 실제 요청
						let tempResponse
						if (tag) {
							tempResponse = await getPostsByTag(tag, limit, tempCursor)
						} else {
							tempResponse = await getPublishedPosts(limit, tempCursor, searchQuery, category)
						}
						
						// 다음 페이지를 위한 커서 저장
						const nextCacheKey = getCacheKey(searchQuery, category || '', tag || '', i + 1)
						cursorCache.set(nextCacheKey, {
							cursor: tempResponse.nextCursor,
							timestamp: Date.now()
						})
						
						tempCursor = tempResponse.nextCursor
					}
				}
				
				cursor = tempCursor
			}
		}
		
		let response
		
		// If tag filter is specified, use getPostsByTag
		if (tag) {
			response = await getPostsByTag(tag, limit, cursor)
		} else {
			// Otherwise use regular getPublishedPosts with search and category filters
			response = await getPublishedPosts(limit, cursor, searchQuery, category)
		}
		
		// 다음 페이지를 위한 커서 저장
		if (response.nextCursor) {
			const nextPageKey = getCacheKey(searchQuery, category || '', tag || '', page + 1)
			cursorCache.set(nextPageKey, {
				cursor: response.nextCursor,
				timestamp: Date.now()
			})
		}
		
		// Use the posts directly from the response (already filtered and paginated)
		const paginatedPosts = response.posts
		
		// For page-based navigation (approximation since Notion uses cursor-based)
		// Note: totalPosts and totalPages are estimates for UI purposes
		// Actual pagination should use cursor-based approach for accuracy
		const hasMore = response.hasMore
		
		// Since Notion API doesn't provide total count with filters,
		// we'll use hasMore for navigation and estimate totals
		const totalPosts = hasMore ? (page * limit) + 1 : paginatedPosts.length + ((page - 1) * limit)
		const totalPages = Math.ceil(totalPosts / limit)
		
		return NextResponse.json({
			posts: paginatedPosts,
			pagination: {
				page,
				limit,
				totalPosts,
				totalPages,
				hasMore,
				hasNext: hasMore,
				hasPrevious: page > 1,
				nextCursor: response.nextCursor
			}
		})
	} catch (error) {
		console.error('Error fetching posts:', error)
		return NextResponse.json(
			{ 
				posts: [], 
				pagination: {
					page: 1,
					limit: 9,
					totalPosts: 0,
					totalPages: 0,
					hasMore: false,
					hasNext: false,
					hasPrevious: false
				},
				error: '포스트를 불러오는데 실패했습니다' 
			},
			{ status: 500 }
		)
	}
}