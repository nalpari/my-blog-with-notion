'use client'

import * as React from 'react'
import { useTags } from '@/hooks/useTags'
import { TagCloud, TagHeader } from '@/components/tags/TagCloud'
import { PostsLoading } from '@/components/posts/PostsLoading'

/**
 * 클라이언트 사이드 태그 페이지 컴포넌트
 * 
 * @description
 * useTags 훅을 사용하여 태그 데이터를 동적으로 로드하고,
 * 로딩 상태와 에러 처리를 포함한 인터랙티브한 태그 페이지를 제공합니다.
 * 
 * 주요 기능:
 * - 태그 데이터 동적 로딩
 * - 로딩 상태 표시
 * - 에러 처리 및 재시도 기능
 * - 인기 태그와 전체 태그 구분 표시
 * - 반응형 레이아웃
 */
export function TagsPageClient() {
  const { tags, loading, error, totalTags, totalPosts, refreshTags } = useTags()

  // 로딩 상태
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* 헤더 스켈레톤 */}
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse w-32" />
            <div className="h-6 bg-muted rounded animate-pulse w-96" />
            <div className="flex items-center gap-6">
              <div className="h-4 bg-muted rounded animate-pulse w-24" />
              <div className="h-4 bg-muted rounded animate-pulse w-32" />
            </div>
          </div>
          
          {/* 태그 로딩 */}
          <PostsLoading />
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold">태그를 불러올 수 없습니다</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>
            <button
              onClick={refreshTags}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 정상 상태 - 태그 표시
  if (tags.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <TagHeader totalTags={0} totalPosts={0} />
          
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
        </div>
      </div>
    )
  }

  // 상위 10개 태그 추출 (카운트 내림차순 정렬)
  const topTags = [...tags]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <TagHeader totalTags={totalTags} totalPosts={totalPosts} />
        
        {/* 인기 태그 섹션 */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">인기 태그</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              가장 많이 사용된 태그들입니다
            </p>
          </div>
          <TagCloud tags={topTags} variant="cloud" />
        </section>

        {/* 모든 태그 섹션 */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">모든 태그</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                알파벳 순으로 정렬된 전체 태그 목록입니다
              </p>
            </div>
            
            {/* 새로고침 버튼 */}
            <button
              onClick={refreshTags}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              <svg
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              새로고침
            </button>
          </div>
          
          <TagCloud 
            tags={[...tags].sort((a, b) => a.name.localeCompare(b.name))} 
            variant="list" 
          />
        </section>
      </div>
    </div>
  )
}