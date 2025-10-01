import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllTags, getAllPostsByTag } from '@/lib/notion'
import { ModernTagPage } from '@/app/tags/[slug]/modern-page'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { calculateTagStatistics, getAllTagsWithCount } from '@/lib/tag-statistics'

interface TagPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map((tag) => ({
    slug: tag.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tags = await getAllTags()
  const tag = tags.find(t => t.slug === slug)

  if (!tag) {
    return {
      title: '태그를 찾을 수 없습니다',
    }
  }

  return {
    title: `${tag.name} | 태그 | My Blog`,
    description: `${tag.name} 태그가 포함된 모든 포스트를 확인하세요`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params

  const allTags = await getAllTags()
  const currentTag = allTags.find(t => t.slug === slug)

  if (!currentTag) {
    notFound()
  }

  const postsForStatistics = await getAllPostsByTag(slug)

  let statistics = undefined
  let relatedTags = undefined

  if (postsForStatistics.length > 0) {
    statistics = calculateTagStatistics(postsForStatistics, slug)

    relatedTags = statistics.relatedTags.map((rt) => ({
      ...rt.tag,
      correlation: rt.correlation,
      count: rt.coOccurrenceCount,
    }))
  }

  const allTagsWithCount = getAllTagsWithCount(postsForStatistics)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <ModernTagPage
        tag={currentTag}
        initialPostCount={currentTag.count}
        statistics={statistics}
        relatedTags={relatedTags}
        allTags={allTagsWithCount}
      />

      <Footer />
    </div>
  )
}
