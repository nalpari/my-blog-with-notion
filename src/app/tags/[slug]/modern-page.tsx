'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePostsByTag } from '@/hooks/usePostsByTag'
import { PostsGrid } from '@/components/posts/PostsGrid'
import { TagTrendChart, TagCorrelationChart, PostDistributionHeatmap } from '@/components/tags/TagTrendChart'
import { TagBadge } from '@/components/ui/tag-badge'
import type { Tag } from '@/types/notion'
import type { TagStatistics } from '@/types/tag-statistics'

interface ModernTagPageProps {
  tag: Tag
  initialPostCount: number
  statistics?: TagStatistics
  relatedTags?: Array<Tag & { correlation: number; count: number }>
  allTags?: Array<Tag & { count: number }>
}

export function ModernTagPage({
  tag,
  initialPostCount,
  statistics,
  relatedTags = [],
  allTags = [],
}: ModernTagPageProps) {
  const { posts, loading, error, hasMore, loadMore, refresh } = usePostsByTag(tag.slug)

  // 로딩 상태 - 에디토리얼 스타일 스켈레톤
  if (loading && posts.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-accent/15 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-violet-500/10 to-transparent blur-3xl" />
          <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-rose-500/5 to-transparent blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* 히어로 스켈레톤 */}
            <div className="space-y-8">
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted/50" />
              <div className="space-y-4">
                <div className="h-16 w-48 animate-pulse rounded-2xl bg-muted/50" />
                <div className="h-20 w-80 animate-pulse rounded-2xl bg-muted/50 sm:h-24 sm:w-[28rem]" />
                <div className="h-6 w-full max-w-lg animate-pulse rounded-xl bg-muted/50" />
              </div>
            </div>

            {/* 콘텐츠 스켈레톤 */}
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-80 animate-pulse rounded-3xl bg-muted/50" />
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="h-72 animate-pulse rounded-3xl bg-muted/50" />
                  <div className="h-72 animate-pulse rounded-3xl bg-muted/50" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-96 animate-pulse rounded-3xl bg-muted/50" />
                <div className="h-80 animate-pulse rounded-3xl bg-muted/50" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 에러 상태
  if (error && posts.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-destructive/10 to-transparent blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <TagDetailHero tag={tag} postCount={initialPostCount} />

            <div className="mt-20 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-destructive/10 shadow-lg shadow-destructive/5"
              >
                <svg className="h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </motion.div>

              <h2 className="mb-3 text-2xl font-bold tracking-tight">포스트를 불러올 수 없습니다</h2>
              <p className="mb-8 text-muted-foreground">{error}</p>

              <button
                onClick={refresh}
                className="inline-flex items-center gap-2.5 rounded-full bg-foreground px-7 py-3.5 font-semibold text-background transition-all hover:bg-foreground/90 hover:shadow-xl hover:shadow-foreground/10"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 상위 태그 (사이드바용)
  const topTags = [...allTags].sort((a, b) => b.count - a.count).slice(0, 12)

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-accent/15 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-violet-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-rose-500/5 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-20">
          {/* 히어로 섹션 */}
          <TagDetailHero tag={tag} postCount={posts.length || initialPostCount} />

          {/* 에러 배너 (포스트가 있지만 추가 로딩 실패) */}
          {error && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                  <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-destructive">추가 포스트를 불러올 수 없습니다</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                </div>
                <button
                  onClick={refresh}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  다시 시도
                </button>
              </div>
            </motion.div>
          )}

          {/* 메인 콘텐츠 */}
          <div className="grid gap-10 lg:grid-cols-3">
            {/* 왼쪽: 차트 & 포스트 */}
            <div className="lg:col-span-2 space-y-16">
              {/* 통계 차트 섹션 */}
              {statistics && (
                <section className="space-y-8">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-px w-8 bg-gradient-to-r from-accent to-transparent" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                        Analytics
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">태그 분석</h2>
                    <p className="mt-2 text-muted-foreground">이 태그의 활동 통계와 트렌드</p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <TagTrendChart data={statistics.monthlyTrend} className="rounded-3xl" />
                  </motion.div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <TagCorrelationChart data={statistics.relatedTags} className="rounded-3xl h-full" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <PostDistributionHeatmap data={statistics.postDistribution} className="rounded-3xl h-full" />
                    </motion.div>
                  </div>
                </section>
              )}

              {/* 구분선 */}
              {statistics && posts.length > 0 && (
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
              )}

              {/* 포스트 섹션 */}
              <section className="space-y-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-px w-8 bg-gradient-to-r from-violet-500 to-transparent" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">
                        Posts
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">모든 포스트</h2>
                    <p className="mt-2 text-muted-foreground">이 태그가 포함된 글 목록</p>
                  </div>

                  <span className="shrink-0 rounded-full bg-muted/50 px-4 py-2 text-sm font-medium tabular-nums">
                    {posts.length}개
                  </span>
                </div>

                {posts.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <PostsGrid posts={posts} />

                    {hasMore && (
                      <div className="mt-12 text-center">
                        {loading ? (
                          <div className="inline-flex items-center gap-3 text-muted-foreground">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span className="text-sm font-medium">더 많은 포스트를 불러오는 중...</span>
                          </div>
                        ) : (
                          <button
                            onClick={loadMore}
                            className="group inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/50 px-7 py-3.5 font-semibold backdrop-blur-sm transition-all hover:border-border hover:bg-card hover:shadow-xl"
                          >
                            더 많은 포스트 보기
                            <svg className="h-4 w-4 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border/50 bg-muted/20 py-20 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                      <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">아직 포스트가 없습니다</p>
                  </div>
                )}
              </section>
            </div>

            {/* 오른쪽: 사이드바 */}
            <div className="space-y-8">
              {/* 태그 클라우드 */}
              {topTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TagCloudSidebar tags={topTags} currentTagSlug={tag.slug} />
                </motion.div>
              )}

              {/* 연관 태그 */}
              {relatedTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <RelatedTagsSidebar tags={relatedTags} />
                </motion.div>
              )}

              {/* 인기 포스트 */}
              {statistics?.topPosts && statistics.topPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <TopPostsSidebar posts={statistics.topPosts} />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트들
// ─────────────────────────────────────────────────────────────────────────────

interface TagDetailHeroProps {
  tag: Tag
  postCount: number
}

function TagDetailHero({ tag, postCount }: TagDetailHeroProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* 브레드크럼 */}
      <Link
        href="/tags"
        className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        모든 태그
      </Link>

      {/* 타이틀 영역 */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <TagBadge tag={tag} size="lg" className="text-xl px-5 py-2.5 shadow-lg" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
            {tag.name}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          이 태그와 관련된 모든 글을 둘러보세요. 최신 트렌드와 인사이트를 확인할 수 있습니다.
        </motion.p>
      </div>

      {/* 통계 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 px-5 py-3.5 backdrop-blur-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{postCount}</p>
            <p className="text-xs font-medium text-muted-foreground">포스트</p>
          </div>
        </div>
      </motion.div>
    </motion.header>
  )
}

interface TagCloudSidebarProps {
  tags: Array<Tag & { count: number }>
  currentTagSlug: string
}

function TagCloudSidebar({ tags, currentTagSlug }: TagCloudSidebarProps) {
  return (
    <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="border-b border-border/50 bg-gradient-to-r from-accent/5 to-accent/10 p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">인기 태그</h3>
            <p className="text-xs text-muted-foreground">가장 많이 사용된 태그</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {tags.map((t, index) => {
            const isActive = t.slug === currentTagSlug
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  href={`/tags/${t.slug}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'border-accent bg-accent text-accent-foreground shadow-md'
                      : 'border-border/50 bg-background/50 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground'
                  }`}
                >
                  {t.name}
                  <span className={`text-xs tabular-nums ${isActive ? 'text-accent-foreground/70' : 'text-muted-foreground/70'}`}>
                    {t.count}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface RelatedTagsSidebarProps {
  tags: Array<Tag & { correlation: number; count: number }>
}

function RelatedTagsSidebar({ tags }: RelatedTagsSidebarProps) {
  const sortedTags = [...tags].sort((a, b) => b.correlation - a.correlation).slice(0, 8)

  return (
    <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="border-b border-border/50 bg-gradient-to-r from-violet-500/5 to-violet-500/10 p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">연관 태그</h3>
            <p className="text-xs text-muted-foreground">함께 자주 사용되는 태그</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {sortedTags.map((t, index) => {
          const correlationPercent = Math.min(100, Math.max(0, t.correlation * 100))
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/tags/${t.slug}`}
                className="group flex items-center justify-between p-4 transition-colors hover:bg-accent/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TagBadge tag={t} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm group-hover:text-accent transition-colors">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.count}개 포스트</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-12 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{ width: `${correlationPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums w-8">
                    {Math.round(correlationPercent)}%
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

interface TopPostsSidebarProps {
  posts: Array<{
    id: string
    title: string
    slug: string
    excerpt?: string
    publishedAt: string
  }>
}

function TopPostsSidebar({ posts }: TopPostsSidebarProps) {
  const displayPosts = posts.slice(0, 5)

  return (
    <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="border-b border-border/50 bg-gradient-to-r from-rose-500/5 to-rose-500/10 p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
            <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">추천 포스트</h3>
            <p className="text-xs text-muted-foreground">이 태그의 인기 글</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {displayPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/posts/${post.slug}`}
              className="group block p-4 transition-colors hover:bg-accent/5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-xs font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h4>
                  {post.excerpt && (
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <time className="mt-2 block text-xs text-muted-foreground/70">
                    {new Date(post.publishedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
