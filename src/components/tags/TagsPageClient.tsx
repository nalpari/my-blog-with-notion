'use client'

import * as React from 'react'
import { useTags } from '@/hooks/useTags'
import { TagCloud, TagHeader } from '@/components/tags/TagCloud'
import { PostsLoading } from '@/components/posts/PostsLoading'

/**
 * Editorial-style Tags Page Client Component
 * 에디토리얼 매거진 스타일의 태그 페이지
 */
export function TagsPageClient() {
  const { tags, loading, error, totalTags, totalPosts, refreshTags } = useTags()

  // 로딩 상태 - 세련된 스켈레톤
  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-accent/10 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-violet-500/5 to-transparent blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-16">
            {/* 헤더 스켈레톤 */}
            <div className="space-y-8">
              <div className="h-8 w-36 animate-pulse rounded-full bg-muted/50" />
              <div className="space-y-4">
                <div className="h-16 w-64 animate-pulse rounded-2xl bg-muted/50 sm:h-20 sm:w-80" />
                <div className="h-6 w-full max-w-md animate-pulse rounded-xl bg-muted/50" />
              </div>
              <div className="flex gap-6">
                <div className="h-16 w-32 animate-pulse rounded-2xl bg-muted/50" />
                <div className="h-16 w-32 animate-pulse rounded-2xl bg-muted/50" />
              </div>
            </div>

            {/* 인기 태그 스켈레톤 */}
            <div className="space-y-6">
              <div className="h-10 w-40 animate-pulse rounded-xl bg-muted/50" />
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-11 animate-pulse rounded-full bg-muted/50"
                    style={{ width: `${100 + (i % 4) * 30}px`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>

            {/* 모든 태그 스켈레톤 */}
            <div className="space-y-6">
              <div className="h-10 w-40 animate-pulse rounded-xl bg-muted/50" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-muted/50"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 에러 상태 - 세련된 에러 UI
  if (error) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-destructive/5 to-transparent blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
              <svg className="h-10 w-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h2 className="mb-3 text-2xl font-bold tracking-tight">태그를 불러올 수 없습니다</h2>
            <p className="mb-8 text-muted-foreground">{error}</p>

            <button
              onClick={refreshTags}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-medium text-background transition-all hover:bg-foreground/90 hover:shadow-lg"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              다시 시도
            </button>
          </div>
        </div>
      </main>
    )
  }

  // 빈 상태
  if (tags.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-accent/10 to-transparent blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <TagHeader totalTags={0} totalPosts={0} />

            <div className="mt-20 text-center">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/50">
                <svg className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">아직 태그가 없습니다</h3>
              <p className="text-muted-foreground">포스트에 태그를 추가하면 여기에 표시됩니다</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 상위 태그 추출
  const topTags = [...tags].sort((a, b) => b.count - a.count).slice(0, 10)
  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-accent/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-violet-500/5 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-rose-500/5 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-20">
          {/* 헤더 */}
          <TagHeader totalTags={totalTags} totalPosts={totalPosts} />

          {/* 인기 태그 섹션 */}
          <section className="space-y-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px w-8 bg-gradient-to-r from-accent to-transparent" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                    Trending
                  </span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">인기 태그</h2>
                <p className="mt-2 text-muted-foreground">가장 많이 사용된 태그들</p>
              </div>
            </div>

            <TagCloud tags={topTags} variant="cloud" />
          </section>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-background px-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent/50" />
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <div className="h-1.5 w-1.5 rounded-full bg-accent/50" />
                </div>
              </div>
            </div>
          </div>

          {/* 모든 태그 섹션 */}
          <section className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px w-8 bg-gradient-to-r from-violet-500 to-transparent" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">
                    All Topics
                  </span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">모든 태그</h2>
                <p className="mt-2 text-muted-foreground">알파벳 순으로 정렬된 전체 태그 목록</p>
              </div>

              {/* 새로고침 버튼 */}
              <button
                onClick={refreshTags}
                disabled={loading}
                className="group inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-border hover:text-foreground hover:shadow-lg"
              >
                <svg
                  className={`h-4 w-4 transition-transform group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                새로고침
              </button>
            </div>

            <TagCloud tags={sortedTags} variant="list" />
          </section>
        </div>
      </div>
    </main>
  )
}
