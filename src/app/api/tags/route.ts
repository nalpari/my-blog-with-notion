import { NextResponse } from 'next/server'
import { getAllTags } from '@/lib/notion'

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
export async function GET() {
  try {
    // 모든 태그와 카운트 가져오기
    const tags = await getAllTags()
    
    // 전체 통계 계산
    const totalTags = tags.length
    const totalPosts = tags.reduce((sum, tag) => sum + tag.count, 0)
    
    return NextResponse.json({
      tags,
      totalTags,
      totalPosts,
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch tags',
        tags: [],
        totalTags: 0,
        totalPosts: 0,
      },
      { status: 500 }
    )
  }
}