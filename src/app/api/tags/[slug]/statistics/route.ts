import { NextResponse } from 'next/server'
import { getAllPostsByTag, getAllTags } from '@/lib/notion'
import { calculateTagStatistics } from '@/lib/tag-statistics'
import type { TagStatisticsResponse } from '@/types/tag-statistics'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const posts = await getAllPostsByTag(slug)

    if (posts.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    const allTags = await getAllTags()
    const tag = allTags.find((t) => t.slug === slug)

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    const statistics = calculateTagStatistics(posts, slug)

    const response: TagStatisticsResponse = {
      tag,
      statistics,
      totalPostCount: posts.length,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching tag statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tag statistics' },
      { status: 500 }
    )
  }
}
