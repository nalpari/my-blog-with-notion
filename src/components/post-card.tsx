/**
 * @fileoverview PostCard 컴포넌트 - 블로그 포스트를 카드 형태로 표시
 * 
 * 주요 기능:
 * - 반응형 카드 레이아웃으로 포스트 정보 표시
 * - 이미지 최적화 및 lazy loading 지원
 * - 호버 효과와 트랜지션 애니메이션
 * - 태그 시스템 통합
 * - 접근성 고려한 시맨틱 마크업
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { optimizeNotionImageUrl, getImageSizes } from '@/lib/image-utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TagList } from '@/components/ui/tag-badge'
import type { Post } from '@/types/notion'
import { formatDate } from '@/lib/date-utils'

/**
 * PostCard 컴포넌트의 Props 인터페이스
 * 
 * @interface PostCardProps
 * @property {Post} post - Notion에서 가져온 포스트 데이터
 * @property {boolean} [priority=false] - 이미지 로딩 우선순위 설정
 *                                        첫 3개 포스트는 true로 설정하여 LCP 최적화
 */
interface PostCardProps {
  post: Post
  priority?: boolean
}

/**
 * 블로그 포스트를 카드 형태로 표시하는 컴포넌트
 * 
 * @component
 * @example
 * ```tsx
 * <PostCard 
 *   post={postData} 
 *   priority={index < 3} // 첫 3개 포스트는 우선 로딩
 * />
 * ```
 * 
 * @description
 * 이 컴포넌트는 다음과 같은 UI/UX 최적화를 포함합니다:
 * 
 * 1. **이미지 최적화**
 *    - Next.js Image 컴포넌트로 자동 최적화
 *    - 반응형 sizes 속성으로 뷰포트별 최적 크기 제공
 *    - priority prop으로 Above-the-fold 이미지 우선 로딩
 * 
 * 2. **호버 인터랙션**
 *    - 카드 호버시 그림자 효과와 이미지 확대
 *    - 제목 색상 변경으로 클릭 가능 영역 표시
 *    - smooth transition으로 부드러운 애니메이션
 * 
 * 3. **접근성**
 *    - 시맨틱 HTML 구조 (article, header, etc.)
 *    - 이미지 alt 텍스트 제공
 *    - 키보드 네비게이션 지원
 * 
 * 4. **성능 최적화**
 *    - CSS-in-JS 대신 Tailwind CSS 사용
 *    - 조건부 렌더링으로 불필요한 DOM 노드 방지
 *    - line-clamp으로 텍스트 오버플로우 처리
 */
export function PostCard({ post, priority = false }: PostCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden p-0 h-full">
        {/* 커버 이미지 영역 - 클릭 가능한 링크로 감싸기 */}
        <Link href={`/posts/${post.slug}`} className="block">
          {post.coverImage && (
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes={getImageSizes('card')} // 반응형 이미지 크기 계산
                priority={priority} // LCP 최적화를 위한 우선 로딩
                loading={priority ? "eager" : "lazy"} // 로딩 전략 설정
                unoptimized={false} // Next.js 이미지 최적화 활성화
              />
            </div>
          )}
          {/* 커버 이미지가 없을 때 표시할 플레이스홀더 */}
          {!post.coverImage && (
            <div className="relative h-48 w-full overflow-hidden bg-muted flex items-center justify-center">
              <div className="text-muted-foreground">
                {/* 이미지 아이콘 SVG - 시각적 힌트 제공 */}
                <svg
                  className="w-12 h-12"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </Link>
        
        {/* 카드 헤더 영역 - 메타데이터와 제목 */}
        <CardHeader className="p-6 pb-4">
          {/* 메타데이터 행 - 날짜와 카테고리 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span>{formatDate(post.publishedAt)}</span>
            {post.category && (
              <>
                <span>•</span>
                {/* 카테고리 배지 - 시각적 구분을 위한 배경색 적용 */}
                <span className="bg-accent/10 text-accent px-2 py-1 rounded-md text-xs font-medium">
                  {post.category.name}
                </span>
              </>
            )}
          </div>
          {/* 포스트 제목 - 클릭 가능한 링크 */}
          <Link href={`/posts/${post.slug}`} className="block">
            <CardTitle className="text-lg group-hover:text-accent transition-colors line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">
              {post.title}
            </CardTitle>
          </Link>
          {/* 태그 목록 - 최대 3개까지만 표시하여 UI 일관성 유지 */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-2">
              <TagList 
                tags={post.tags} 
                maxTags={3} // UI 일관성을 위해 3개로 제한
                size="sm" // 작은 크기로 표시
                clickable // 클릭하여 태그 페이지로 이동 가능
              />
            </div>
          )}
          {/* 포스트 요약 - 3줄로 제한하여 카드 높이 일관성 유지 */}
          <CardDescription className="line-clamp-3 mt-2">
            {post.excerpt}
          </CardDescription>
        </CardHeader>
        {/* 카드 푸터 영역 - 읽기 시간과 CTA 버튼 */}
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between">
            {/* 예상 읽기 시간 표시 */}
            <span className="text-sm text-muted-foreground">
              {post.readingTime}분 읽기
            </span>
            {/* CTA(Call-to-Action) 버튼 - 호버시 색상 반전 효과 */}
            <Link 
              href={`/posts/${post.slug}`}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-accent hover:text-white hover:bg-accent rounded-md transition-colors"
            >
              읽기 →
            </Link>
          </div>
        </CardContent>
      </Card>
  )
}