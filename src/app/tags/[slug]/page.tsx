import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllTags } from '@/lib/notion'
import { TagPageClient } from '@/components/tags/TagPageClient'
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

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  
  // 태그 정보 가져오기
  const tags = await getAllTags()
  const currentTag = tags.find(t => t.slug === slug)

  if (!currentTag) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* 
        클라이언트 사이드 컴포넌트 사용
        - 동적 포스트 로딩
        - 무한 스크롤 / Load More 기능
        - 인터랙티브 기능 (새로고침, 에러 처리)
        - 로딩 상태 관리
      */}
      <TagPageClient 
        tag={currentTag} 
        initialPostCount={currentTag.count}
      />
      
      <Footer />
    </div>
  )
}