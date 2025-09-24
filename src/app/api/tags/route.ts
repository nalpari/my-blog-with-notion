import { NextResponse } from 'next/server'
import { getAllTags, getTotalPublishedPostsCount } from '@/lib/notion'

/**
 * GET /api/tags
 * 
 * 모든 태그 목록과 포스트 카운트를 반환합니다.
 * 
 * Query Parameters:
 * - None (모든 태그를 반환)
 * 
 * Response:
 * ```json
 * {
 *   "tags": [
 *     {
 *       "id": "tag-id",
 *       "name": "Tag Name",
 *       "slug": "tag-slug",
 *       "color": "blue",
 *       "count": 5
 *     }
 *   ],
 *   "totalTags": 10,
 *   "totalPosts": 25
 * }
 * ```
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const debug = searchParams.get('debug') === 'true'
    
    console.log('🏷️ Tags API called', debug ? '(debug mode)' : '')
    
    // 모든 태그와 카운트 가져오기
    const [tags, totalPosts] = await Promise.all([
      getAllTags(),
      getTotalPublishedPostsCount()
    ])
    
    // 전체 통계 계산
    const totalTags = tags.length
    
    const response = {
      tags,
      totalTags,
      totalPosts, // 실제 포스트 수 (중복 제거됨)
      ...(debug && {
        debug: {
          timestamp: new Date().toISOString(),
          tagNames: tags.map(t => t.name),
          tagCounts: tags.map(t => ({ name: t.name, count: t.count })),
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasNotionToken: !!process.env.NOTION_TOKEN,
            hasNotionDb: !!process.env.NOTION_DATABASE_ID,
          }
        }
      })
    }
    
    if (debug) {
      console.log('🔍 Debug response:', JSON.stringify(response, null, 2))
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error fetching tags:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch tags',
        message: error instanceof Error ? error.message : 'Unknown error',
        tags: [],
        totalTags: 0,
        totalPosts: 0,
      },
      { status: 500 }
    )
  }
}