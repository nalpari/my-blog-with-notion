import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostsByTag, getAllTags } from '@/lib/notion'
import { PostsGrid } from '@/components/posts/PostsGrid'
import { PostsPaginationNav } from '@/components/posts/PostsPaginationNav'
import { TagPageHeader } from '@/components/tags/TagCloud'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'


interface TagPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

// 정적 파라미터 생성 (SSG)
export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map((tag) => ({
    slug: tag.slug,
  }))
}

// 메타데이터 생성
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

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  
  // page 파라미터를 견고하게 처리
  const pageParam = resolvedSearchParams.page
  const pageValue = Array.isArray(pageParam) ? pageParam[0] : pageParam
  const parsedPage = parseInt(pageValue || '1', 10)
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage
  const postsPerPage = 9

  // 태그 정보 가져오기
  const tags = await getAllTags()
  const currentTag = tags.find(t => t.slug === slug)

  if (!currentTag) {
    notFound()
  }

  // 태그로 찾기 위해 슬러그 사용 (getPostsByTag가 내부적으로 이름으로 변환)
  const { posts } = await getPostsByTag(
    slug,
    postsPerPage,
    currentPage > 1 ? String((currentPage - 1) * postsPerPage) : undefined
  )

  const totalPosts = currentTag.count
  const totalPages = Math.ceil(totalPosts / postsPerPage)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <TagPageHeader tag={currentTag} postCount={totalPosts} />

          {posts.length > 0 ? (
            <>
              <PostsGrid posts={posts} />
              
              {totalPages > 1 && (
                <PostsPaginationNav
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath={`/tags/${slug}`}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold">포스트가 없습니다</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                이 태그에 해당하는 포스트가 아직 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}