import { NextResponse } from 'next/server'
import { getAllPostsByTag } from '@/lib/notion'
import { calculateTagStatistics } from '@/lib/tag-statistics'
import type { RelatedTagsResponse } from '@/types/tag-statistics'

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

    let tag = null
    for (const post of posts) {
      const foundTag = post.tags.find((t) => t.slug === slug)
      if (foundTag) {
        tag = foundTag
        break
      }
    }

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    const statistics = calculateTagStatistics(posts, slug)

    const response: RelatedTagsResponse = {
      tag,
      relatedTags: statistics.relatedTags,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching related tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch related tags' },
      { status: 500 }
    )
  }
}
