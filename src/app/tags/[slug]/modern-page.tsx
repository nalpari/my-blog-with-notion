'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { usePostsByTag } from '@/hooks/usePostsByTag'
import { PostsGrid } from '@/components/posts/PostsGrid'
import { PostsLoading } from '@/components/posts/PostsLoading'
import { TagHeroSection, RelatedTagsCard, TopPostsCard } from '@/components/tags/TagHeroSection'
import { TagTrendChart, TagCorrelationChart, PostDistributionHeatmap } from '@/components/tags/TagTrendChart'
import { TagCloudCard } from '@/components/tags/EnhancedTagCloud'
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="h-64 bg-muted rounded-2xl animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PostsLoading />
              </div>
              <div className="space-y-6">
                <div className="h-96 bg-muted rounded-xl animate-pulse" />
                <div className="h-64 bg-muted rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <TagHeroSection tag={tag} postCount={initialPostCount} />
          <div className="mt-12 text-center py-12">
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
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={refresh}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
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
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <TagHeroSection tag={tag} postCount={posts.length || initialPostCount} />
        </motion.div>

        {error && posts.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4"
          >
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5"
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
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-destructive">
                  추가 포스트를 불러올 수 없습니다
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
              <button
                onClick={refresh}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-destructive/50 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <svg
                  className="w-3 h-3"
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
                다시 시도
              </button>
            </div>
          </motion.div>
        )}

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {statistics && (
              <>
                <motion.div variants={itemVariants}>
                  <TagTrendChart data={statistics.monthlyTrend} />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants}>
                    <TagCorrelationChart data={statistics.relatedTags} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <PostDistributionHeatmap data={statistics.postDistribution} />
                  </motion.div>
                </div>
              </>
            )}

            <motion.div variants={itemVariants} className="pt-6">
              <h2 className="text-2xl font-bold mb-6">포스트</h2>
              {posts.length > 0 ? (
                <>
                  <PostsGrid posts={posts} />

                  {hasMore && (
                    <div className="text-center py-8">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            더 많은 포스트를 불러오는 중...
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={loadMore}
                          className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors"
                        >
                          더 많은 포스트 보기
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">포스트가 없습니다</p>
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-6">
            {allTags.length > 0 && (
              <motion.div variants={itemVariants}>
                <TagCloudCard tags={allTags} maxTags={30} />
              </motion.div>
            )}

            {relatedTags.length > 0 && (
              <motion.div variants={itemVariants}>
                <RelatedTagsCard tags={relatedTags} maxTags={8} />
              </motion.div>
            )}

            {statistics?.topPosts && statistics.topPosts.length > 0 && (
              <motion.div variants={itemVariants}>
                <TopPostsCard posts={statistics.topPosts} maxPosts={5} />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
