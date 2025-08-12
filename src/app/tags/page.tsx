import { Metadata } from 'next'
import { getAllTags } from '@/lib/notion'
import { TagCloud, TagHeader } from '@/components/tags/TagCloud'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: '태그 | My Blog',
  description: '블로그의 모든 태그를 둘러보세요',
}

export default async function TagsPage() {
  const tags = await getAllTags()
  
  // 전체 포스트 수 계산
  const totalPosts = tags.reduce((sum, tag) => sum + tag.count, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <TagHeader totalTags={tags.length} totalPosts={totalPosts} />
          
          {tags.length > 0 ? (
            <>
              {/* 인기 태그 섹션 */}
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">인기 태그</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    가장 많이 사용된 태그들입니다
                  </p>
                </div>
                <TagCloud tags={tags} maxTags={10} variant="cloud" />
              </section>

              {/* 모든 태그 섹션 */}
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">모든 태그</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    알파벳 순으로 정렬된 전체 태그 목록입니다
                  </p>
                </div>
                <TagCloud 
                  tags={tags.sort((a, b) => a.name.localeCompare(b.name))} 
                  variant="list" 
                />
              </section>
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold">태그가 없습니다</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                아직 생성된 태그가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}