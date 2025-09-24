import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import type {
  QueryDatabaseResponse,
  PageObjectResponse,
  GetDatabaseResponse,
  SelectPropertyItemObjectResponse,
  StatusPropertyItemObjectResponse,
  MultiSelectPropertyItemObjectResponse,
  QueryDatabaseParameters
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const DATABASE_ID = process.env.NOTION_DATABASE_ID!
const DEBUG_SECRET = process.env.DEBUG_SECRET || process.env.REVALIDATE_SECRET // 디버그용 시크릿 토큰

// Debug response type definition
type DebugInfo = {
  totalResults: number
  hasMore: boolean
  samplePosts: Array<{
    id: string
    title: string
    status: string
    tags: {
      raw: unknown
      processed: Array<{
        id: string
        name: string
        color: string
        isEmpty: boolean
      }>
    }
  }>
  databaseSchema: {
    title: string
    properties: Record<string, {
      type: string
      name: string
    }>
  } | null
}

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

    // 먼저 데이터베이스 스키마를 가져와서 속성 타입 확인
    const dbInfo: GetDatabaseResponse = await notion.databases.retrieve({ database_id: DATABASE_ID })
    const statusProperty = dbInfo.properties.status

    // status 속성의 타입에 따라 필터 동적 생성
    let filter: QueryDatabaseParameters['filter'] | undefined
    if (statusProperty) {
      const statusPropertyType = statusProperty.type

      if (statusPropertyType === 'status') {
        // status 타입일 때
        filter = {
          property: 'status',
          status: {
            equals: statusFilter,
          },
        }
      } else if (statusPropertyType === 'select') {
        // select 타입일 때
        filter = {
          property: 'status',
          select: {
            equals: statusFilter,
          },
        }
      } else {
        // 다른 타입일 경우 기본값으로 select 사용
        console.warn(`Unexpected status property type: ${statusPropertyType}, using select filter`)
        filter = {
          property: 'status',
          select: {
            equals: statusFilter,
          },
        }
      }
    } else {
      // status 속성이 없을 경우
      console.warn('No status property found in database schema')
      filter = undefined
    }

    // 데이터 쿼리 실행
    const queryOptions: QueryDatabaseParameters = {
      database_id: DATABASE_ID,
      page_size: pageSize, // 항상 1-100 사이의 정수
    }

    if (filter) {
      queryOptions.filter = filter
    }

    const response: QueryDatabaseResponse = await notion.databases.query(queryOptions)

    const debugInfo: DebugInfo = {
      totalResults: response.results.length,
      hasMore: response.has_more,
      samplePosts: response.results.map((page) => {
        // Type guard to ensure it's a PageObjectResponse
        if (!('properties' in page)) {
          return {
            id: page.id,
            title: 'No title',
            status: 'No status',
            tags: { raw: undefined, processed: [] }
          }
        }

        const pageObject = page as PageObjectResponse
        const properties = pageObject.properties

        // Extract status value based on property type
        let statusValue: string | undefined
        if (statusProperty?.type === 'status' && properties.status?.type === 'status') {
          const statusProp = properties.status as StatusPropertyItemObjectResponse
          statusValue = statusProp.status?.name
        } else if (statusProperty?.type === 'select' && properties.status?.type === 'select') {
          const selectProp = properties.status as SelectPropertyItemObjectResponse
          statusValue = selectProp.select?.name
        }

        // Extract title
        let title = 'No title'
        if (properties.title?.type === 'title') {
          const titleProp = properties.title
          if ('title' in titleProp && Array.isArray(titleProp.title) && titleProp.title.length > 0) {
            title = titleProp.title[0]?.plain_text || 'No title'
          }
        }

        // Extract tags
        let processedTags: Array<{ id: string; name: string; color: string; isEmpty: boolean }> = []
        if (properties.tags?.type === 'multi_select') {
          const tagsProp = properties.tags as MultiSelectPropertyItemObjectResponse
          processedTags = tagsProp.multi_select.map(tag => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            isEmpty: !tag.name || tag.name.trim().length === 0
          }))
        }

        return {
          id: pageObject.id,
          title,
          status: statusValue || 'No status',
          tags: {
            raw: properties.tags,
            processed: processedTags
          }
        }
      }),
      // 데이터베이스 스키마 정보
      databaseSchema: {
        title: ('title' in dbInfo && Array.isArray(dbInfo.title) && dbInfo.title.length > 0)
          ? dbInfo.title[0]?.plain_text || 'Database'
          : 'Database',
        properties: Object.keys(dbInfo.properties).reduce<Record<string, { type: string; name: string }>>((acc, key) => {
          const prop = dbInfo.properties[key]
          acc[key] = {
            type: prop.type,
            name: prop.name || key
          }
          return acc
        }, {})
      }
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