import { Client } from '@notionhq/client'
import { NextRequest, NextResponse } from 'next/server'

// 노션 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// 노션 파일 타입
type NotionFile = {
  type: 'external' | 'file'
  external?: { url: string }
  file?: { url: string }
}

// 페이지 속성에서 coverImage 추출을 위한 타입
interface PageProperties {
  coverImage?: {
    files: NotionFile[]
  }
}

/**
 * 커버 이미지 프록시 API
 * GET /api/cover-image/[pageId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params

    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      )
    }

    // 노션 API로 페이지 속성 조회
    const page = await notion.pages.retrieve({ page_id: pageId })

    // 페이지 속성에서 coverImage 추출
    const properties = (page as { properties: PageProperties }).properties
    const coverImageFiles = properties.coverImage?.files

    if (!coverImageFiles || coverImageFiles.length === 0) {
      return NextResponse.json(
        { error: 'No cover image found' },
        { status: 404 }
      )
    }

    // 이미지 URL 추출
    const file = coverImageFiles[0]
    let imageUrl: string | undefined

    if (file.type === 'external') {
      imageUrl = file.external?.url
    } else if (file.type === 'file') {
      imageUrl = file.file?.url
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL not found' },
        { status: 404 }
      )
    }

    // 이미지 데이터 fetch
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 502 }
      )
    }

    // Content-Type 추출
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // 이미지 데이터를 버퍼로 변환
    const imageBuffer = await imageResponse.arrayBuffer()

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // 1시간 캐싱 + 30분 stale-while-revalidate
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=1800',
      },
    })
  } catch (error) {
    console.error('Error proxying cover image:', error)

    // 노션 API 에러 처리
    if (error instanceof Error && error.message.includes('Could not find page')) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
