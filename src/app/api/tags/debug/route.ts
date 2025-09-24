import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const DATABASE_ID = process.env.NOTION_DATABASE_ID!
const DEBUG_SECRET = process.env.DEBUG_SECRET || process.env.REVALIDATE_SECRET // 디버그용 시크릿 토큰

/**
 * GET /api/tags/debug
 *
 * 디버깅용 엔드포인트 - 실제 Notion 데이터 구조 확인
 * Production에서는 비활성화되며, 개발 환경에서도 Bearer 토큰 인증 필요
 */
export async function GET(request: Request) {
  try {
    // 1. Production 환경에서는 접근 차단
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    // URL 객체 생성하여 안전하게 파라미터 추출
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // 2. Bearer 토큰 검증
    const authHeader = request.headers.get('Authorization')
    const token = searchParams.get('token') // 쿼리 파라미터로도 받을 수 있도록

    const providedToken = authHeader?.replace('Bearer ', '') || token

    if (!providedToken || !DEBUG_SECRET || providedToken !== DEBUG_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔍 Starting debug analysis...')

    // 3. URL 파라미터에서 옵션 파싱
    const pageSizeParam = searchParams.get('page_size')
    const parsedPageSize = parseInt(pageSizeParam || '5', 10)
    // NaN 체크 후 안전한 기본값 사용, 1-100 범위로 제한
    const pageSize = isNaN(parsedPageSize)
      ? 5
      : Math.max(1, Math.min(parsedPageSize, 100))

    const statusFilter = searchParams.get('status') || 'Published'

    // 첫 번째 페이지만 가져와서 구조 분석
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'status',
        select: {
          equals: statusFilter,
        },
      },
      page_size: pageSize, // 항상 1-100 사이의 정수
    })

    const debugInfo = {
      totalResults: response.results.length,
      hasMore: response.has_more,
      samplePosts: response.results.map((page: any) => {
        const properties = page.properties
        return {
          id: page.id,
          title: properties.title?.title?.[0]?.plain_text || 'No title',
          status: properties.status?.select?.name || 'No status',
          tags: {
            raw: properties.tags,
            processed: properties.tags?.multi_select?.map((tag: any) => ({
              id: tag.id,
              name: tag.name,
              color: tag.color,
              isEmpty: !tag.name || tag.name.trim().length === 0
            })) || []
          }
        }
      }),
      // 데이터베이스 스키마 정보
      databaseSchema: null as any
    }

    // 데이터베이스 스키마도 가져오기
    try {
      const dbInfo = await notion.databases.retrieve({ database_id: DATABASE_ID })
      debugInfo.databaseSchema = {
        title: (dbInfo as any).title || 'Database',
        properties: Object.keys(dbInfo.properties).reduce((acc: any, key) => {
          const prop = (dbInfo.properties as any)[key]
          acc[key] = {
            type: prop.type,
            name: prop.name || key
          }
          return acc
        }, {})
      }
    } catch (schemaError) {
      console.error('Error fetching database schema:', schemaError)
    }

    console.log('🔍 Debug info collected:', JSON.stringify(debugInfo, null, 2))

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('❌ Debug API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch debug info',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}