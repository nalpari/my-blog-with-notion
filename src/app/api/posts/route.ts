import { NextRequest, NextResponse } from 'next/server'
import { getPublishedPosts } from '@/lib/notion'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const limit = parseInt(searchParams.get('limit') || '100')
		const startCursor = searchParams.get('cursor') || undefined

		const response = await getPublishedPosts(limit, startCursor)

		return NextResponse.json(response)
	} catch (error) {
		console.error('Error fetching posts:', error)
		return NextResponse.json(
			{ posts: [], hasMore: false, error: 'Failed to fetch posts' },
			{ status: 500 }
		)
	}
}