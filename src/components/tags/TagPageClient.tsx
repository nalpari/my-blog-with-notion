'use client'

import * as React from 'react'
import { usePostsByTag } from '@/hooks/usePostsByTag'
import { PostsGrid } from '@/components/posts/PostsGrid'
import { PostsLoading } from '@/components/posts/PostsLoading'
import { TagPageHeader } from '@/components/tags/TagCloud'
import type { Tag } from '@/types/notion'

interface TagPageClientProps {
  tag: Tag
  initialPostCount: number
}

/**
 * 클라이언트 사이드 개별 태그 페이지 컴포넌트
 * 
 * @description
 * usePostsByTag 훅을 사용하여 특정 태그의 포스트를 동적으로 로드하고,
 * 무한 스크롤과 로딩 상태 관리를 포함한 인터랙티브한 태그 페이지를 제공합니다.
 * 
 * 주요 기능:
 * - 태그별 포스트 동적 로딩
 * - 무한 스크롤 또는 'Load More' 버튼
 * - 로딩 상태 표시
 * - 에러 처리 및 재시도 기능
 * - 반응형 그리드 레이아웃
 */
export function TagPageClient({ tag, initialPostCount }: TagPageClientProps) {
  const { 
    posts, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  } = usePostsByTag(tag.slug)

  // 로딩 상태 (초기 로딩)
  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* 헤더 스켈레톤 */}
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse w-24" />
            <div className="flex items-center gap-4">
              <div className="h-8 bg-muted rounded-full animate-pulse w-20" />
              <div>
                <div className="h-8 bg-muted rounded animate-pulse w-48 mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-32" />
              </div>
            </div>
          </div>
          
          {/* 포스트 그리드 스켈레톤 */}
          <PostsLoading />
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <TagPageHeader tag={tag} postCount={initialPostCount} />
          
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
            <h3 className="mt-4 text-lg font-semibold">포스트를 불러올 수 없습니다</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>
            <button
              onClick={refresh}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <TagPageHeader tag={tag} postCount={posts.length || initialPostCount} />

        {posts.length > 0 ? (
          <>
            {/* 포스트 그리드 */}
            <PostsGrid posts={posts} />
            
            {/* Load More 버튼 또는 로딩 상태 */}
            {hasMore && (
              <div className="text-center py-8">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">더 많은 포스트를 불러오는 중...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadMore}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    더 많은 포스트 보기
                  </button>
                )}
              </div>
            )}
            
            {/* 새로고침 버튼 (하단) */}
            <div className="text-center pt-4 border-t">
              <button
                onClick={refresh}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
            <button
              onClick={refresh}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary border-primary hover:bg-primary hover:text-white transition-colors"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              새로고침
            </button>
          </div>
        )}
      </div>
    </div>
  )
}