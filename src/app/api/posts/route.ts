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
		
		// Parse page number for offset calculation
		const pageParam = searchParams.get('page') || '1'
		const page = Math.max(1, parseInt(pageParam) || 1)
		
		// Parse search query
		const searchQuery = searchParams.get('q') || ''
		
		// Parse category filter
		const category = searchParams.get('category') || ''
		
		// For cursor-based pagination (optional, for future use)
		const cursor = searchParams.get('cursor') || undefined
		
		// Fetch posts with filters
		// Note: This currently fetches all posts and filters client-side
		// In production, these filters should be applied at the database level
		const response = await getPublishedPosts(100, cursor)
		
		// Apply filters (ideally this should be done in the Notion query)
		let filteredPosts = response.posts
		
		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			filteredPosts = filteredPosts.filter(post => 
				post.title.toLowerCase().includes(query) ||
				post.excerpt.toLowerCase().includes(query)
			)
		}
		
		// Category filter
		if (category && category !== 'all') {
			filteredPosts = filteredPosts.filter(post => 
				post.category?.name === category
			)
		}
		
		// Calculate pagination
		const startIndex = (page - 1) * limit
		const endIndex = startIndex + limit
		const paginatedPosts = filteredPosts.slice(startIndex, endIndex)
		const totalPosts = filteredPosts.length
		const totalPages = Math.ceil(totalPosts / limit)
		const hasMore = page < totalPages
		
		return NextResponse.json({
			posts: paginatedPosts,
			pagination: {
				page,
				limit,
				totalPosts,
				totalPages,
				hasMore,
				hasNext: hasMore,
				hasPrevious: page > 1
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
				error: 'Failed to fetch posts' 
			},
			{ status: 500 }
		)
	}
}