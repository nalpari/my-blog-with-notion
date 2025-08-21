/**
 * @fileoverview TagCloud 컴포넌트 - 태그 클라우드 및 리스트 표시
 * 
 * 주요 기능:
 * - 태그 크기를 포스트 수에 비례하여 시각화
 * - 클라우드와 리스트 두 가지 표시 모드 지원
 * - 호버 시 툴팁과 애니메이션 효과
 * - 태그별 포스트 수 표시
 * - 반응형 레이아웃
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types/notion'
import { TagBadge } from '@/components/ui/tag-badge'

/**
 * TagCloud 컴포넌트의 Props 인터페이스
 * 
 * @interface TagCloudProps
 * @property {Array<Tag & { count: number }>} tags - 태그 배열 (포스트 수 포함)
 * @property {number} [maxTags] - 표시할 최대 태그 수
 * @property {string} [className] - 추가 CSS 클래스
 * @property {'cloud' | 'list'} [variant='cloud'] - 표시 모드
 */
interface TagCloudProps {
  tags: Array<Tag & { count: number }>
  maxTags?: number
  className?: string
  variant?: 'cloud' | 'list'
}

/**
 * 태그 클라우드/리스트 컴포넌트
 * 
 * @component
 * @example
 * ```tsx
 * // 클라우드 형태로 표시
 * <TagCloud tags={tags} variant="cloud" maxTags={20} />
 * 
 * // 리스트 형태로 표시
 * <TagCloud tags={tags} variant="list" />
 * ```
 * 
 * @description
 * 이 컴포넌트는 다음과 같은 UI/UX 최적화를 포함합니다:
 * 
 * 1. **동적 크기 조절**
 *    - 포스트 수에 따라 태그 크기 3단계 조절 (sm/md/lg)
 *    - 비율 계산으로 시각적 곀4층구조 표현
 *    - 최대/최소 카운트 기반 상대적 크기 계산
 * 
 * 2. **두 가지 표시 모드**
 *    - Cloud: 태그 크기로 중요도 표현, 컴팩트한 레이아웃
 *    - List: 목록 형태로 명확한 정보 전달
 * 
 * 3. **인터랙션 디자인**
 *    - 호버 시 scale 애니메이션과 그림자 효과
 *    - 툴팁으로 포스트 수 정보 제공
 *    - 화살표 아이콘으로 클릭 가능 표시
 * 
 * 4. **접근성**
 *    - 의미 있는 링크 구조
 *    - 키보드 네비게이션 지원
 *    - 충분한 터치 타겟 크기
 */
export function TagCloud({ tags, maxTags, className, variant = 'cloud' }: TagCloudProps) {
  // 표시할 태그 목록 결정 (maxTags가 설정되면 제한)
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags

  /**
   * 태그 크기 계산 함수
   * 포스트 수에 따라 태그의 시각적 크기를 결정
   * 
   * @description
   * - 최대/최소 카운트를 기반으로 상대적 크기 계산
   * - 70% 이상: 큰 크기 (lg)
   * - 30-70%: 중간 크기 (md)
   * - 30% 미만: 작은 크기 (sm)
   */
  const maxCount = Math.max(...displayTags.map(t => t.count))
  const minCount = Math.min(...displayTags.map(t => t.count))
  
  const getTagSize = (count: number) => {
    // 모든 태그가 동일한 수의 포스트를 가진 경우
    if (maxCount === minCount) return 'md'
    
    // 비율 계산 (0~1 범위)
    const ratio = (count - minCount) / (maxCount - minCount)
    
    // 비율에 따른 크기 결정
    if (ratio > 0.7) return 'lg'  // 상위 30%
    if (ratio > 0.3) return 'md'  // 중간 40%
    return 'sm'                   // 하위 30%
  }

  // 리스트 형태 렌더링
  if (variant === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        {displayTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
          >
            {/* 태그 정보 영역 */}
            <div className="flex items-center gap-3">
              <TagBadge tag={tag} size="md" />
              <span className="text-sm text-muted-foreground">
                {tag.count}개의 포스트
              </span>
            </div>
            {/* 화살표 아이콘 - 호버 시 우쾽으로 이동 애니메이션 */}
            <svg
              className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
    )
  }

  // 클라우드 형태 렌더링 (기본)
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {displayTags.map((tag) => {
        // 태그별 크기 계산
        const size = getTagSize(tag.count)
        
        // 크기에 따른 CSS 클래스 매핑
        const sizeClasses = {
          sm: 'text-sm px-3 py-1.5',        // 작은 태그
          md: 'text-base px-4 py-2',        // 중간 태그
          lg: 'text-lg px-5 py-2.5 font-medium',  // 큰 태그
        }[size]

        return (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className={cn(
              'group relative inline-flex items-center gap-2 rounded-full transition-all duration-200',
              'hover:scale-105 hover:shadow-md',  // 호버 효과
              sizeClasses,
            )}
          >
            {/* 태그 배지 */}
            <TagBadge 
              tag={tag} 
              size={size === 'lg' ? 'md' : 'sm'} 
              className="shadow-none border-0"
            />
            {/* 포스트 수 표시 */}
            <span className="text-xs text-muted-foreground font-medium">
              {tag.count}
            </span>
            
            {/* 
              호버 시 툴팁
              - absolute positioning으로 태그 위에 표시
              - opacity 트랜지션으로 부드러운 표시/숨김
              - pointer-events-none으로 툴팁이 클릭을 방해하지 않음
            */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
              {tag.count}개의 포스트
            </div>
          </Link>
        )
      })}
    </div>
  )
}

/**
 * TagHeader 컴포넌트의 Props 인터페이스
 * 
 * @interface TagHeaderProps
 * @property {number} totalTags - 전체 태그 수
 * @property {number} totalPosts - 전체 포스트 수
 */
interface TagHeaderProps {
  totalTags: number
  totalPosts: number
}

/**
 * 태그 페이지 헤더 컴포넌트
 * 
 * @component
 * @description
 * 태그 페이지 상단에 표시되는 헤더로,
 * 페이지 제목, 설명, 통계 정보를 포함합니다.
 */
export function TagHeader({ totalTags, totalPosts }: TagHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">태그</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          모든 태그를 둘러보고 관심있는 주제의 포스트를 찾아보세요
        </p>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
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
          <span>{totalTags}개의 태그</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
            />
          </svg>
          <span>{totalPosts}개의 포스트</span>
        </div>
      </div>
    </div>
  )
}

/**
 * TagPageHeader 컴포넌트의 Props 인터페이스
 * 
 * @interface TagPageHeaderProps
 * @property {Tag} tag - 태그 정보
 * @property {number} postCount - 해당 태그의 포스트 수
 */
interface TagPageHeaderProps {
  tag: Tag
  postCount: number
}

/**
 * 개별 태그 페이지 헤더 컴포넌트
 * 
 * @component
 * @description
 * 특정 태그 페이지의 헤더로,
 * 브레드크럼 네비게이션과 태그 정보를 표시합니다.
 */
export function TagPageHeader({ tag, postCount }: TagPageHeaderProps) {
  return (
    <div className="space-y-4">
      {/* 브레드크럼 네비게이션 - 태그 목록으로 돌아가기 */}
      <Link
        href="/tags"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        모든 태그
      </Link>
      
      {/* 태그 정보 영역 */}
      <div className="flex items-center gap-4">
        <TagBadge tag={tag} size="md" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tag.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {postCount}개의 포스트
          </p>
        </div>
      </div>
    </div>
  )
}