import { NextRequest, NextResponse } from 'next/server'
import { getPublishedPosts } from '@/lib/notion'

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
		const category = searchParams.get('category') || ''
		
		// For cursor-based pagination
		const cursor = searchParams.get('cursor') || undefined
		
		// Fetch posts with filters applied at the Notion API level
		// This is much more efficient as filtering happens on the database side
		const response = await getPublishedPosts(limit, cursor, searchQuery, category)
		
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