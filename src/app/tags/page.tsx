import { Metadata } from 'next'
import { getAllTags } from '@/lib/notion'
import { TagsPageClient } from '@/components/tags/TagsPageClient'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: '태그 | My Blog',
  description: '블로그의 모든 태그를 둘러보세요',
}

export default async function TagsPage() {
  // SSR로 초기 태그 데이터 가져오기 (SEO 및 초기 로딩 최적화)
  const tags = await getAllTags()
  
  // 전체 포스트 수 계산
  const totalPosts = tags.reduce((sum, tag) => sum + tag.count, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* 
        클라이언트 사이드 컴포넌트 사용
        - 동적 태그 로딩
        - 인터랙티브 기능 (새로고침, 에러 처리)
        - 로딩 상태 관리
      */}
      <TagsPageClient />
      
      <Footer />
    </div>
  )
}