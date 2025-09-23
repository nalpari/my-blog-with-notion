import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const DATABASE_ID = process.env.NOTION_DATABASE_ID!

/**
 * GET /api/tags/debug
 * 
 * 디버깅용 엔드포인트 - 실제 Notion 데이터 구조 확인
 */
export async function GET() {
  try {
    console.log('🔍 Starting debug analysis...')
    
    // 첫 번째 페이지만 가져와서 구조 분석
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'status',
        select: {
          equals: 'Published',
        },
      },
      page_size: 5, // 처음 5개만
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
      databaseSchema: null
    }

    // 데이터베이스 스키마도 가져오기
    try {
      const dbInfo = await notion.databases.retrieve({ database_id: DATABASE_ID })
      debugInfo.databaseSchema = {
        title: dbInfo.title,
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