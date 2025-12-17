import { Client } from '@notionhq/client'
import { NextRequest, NextResponse } from 'next/server'
import type { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints'

// 노션 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// 이미지 블록 타입 가드
function isImageBlock(
  block: GetBlockResponse
): block is GetBlockResponse & {
  type: 'image'
  image: {
    type: 'external' | 'file'
    external?: { url: string }
    file?: { url: string }
  }
} {
  return 'type' in block && block.type === 'image'
}

/**
 * 노션 이미지 블록에서 이미지를 가져와 프록시하는 API
 * GET /api/notion-image/[blockId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const { blockId } = await params

    if (!blockId) {
      return NextResponse.json(
        { error: 'Block ID is required' },
        { status: 400 }
      )
    }

    // 노션 API로 블록 정보 조회
    const block = await notion.blocks.retrieve({ block_id: blockId })

    // 이미지 블록인지 확인
    if (!isImageBlock(block)) {
      return NextResponse.json(
        { error: 'Block is not an image' },
        { status: 400 }
      )
    }

    // 이미지 URL 추출
    let imageUrl: string | undefined
    if (block.image.type === 'external') {
      imageUrl = block.image.external?.url
    } else if (block.image.type === 'file') {
      imageUrl = block.image.file?.url
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

    // 이미지 데이터를 스트림으로 반환
    const imageBuffer = await imageResponse.arrayBuffer()

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // 30분 캐싱 (노션 URL은 1시간 만료이므로 안전하게 30분)
        'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('Error proxying Notion image:', error)

    // 노션 API 에러 처리
    if (error instanceof Error && error.message.includes('Could not find block')) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
