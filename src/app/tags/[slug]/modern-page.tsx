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

// ... imports

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

  // Loading and Error states simplified for brevity (could also be styled better if needed)
  if (loading && posts.length === 0) return <div className="p-20 text-center">Loading...</div>
  if (error && posts.length === 0) return <div className="p-20 text-center text-destructive">{error}</div>

  return (
    <div className="min-h-screen">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-muted/30 to-transparent pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 py-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-10">
            <TagHeroSection tag={tag} postCount={posts.length || initialPostCount} />
          </motion.div>

          {error && posts.length > 0 && (
            // Error toast styiling...
            <div className="text-destructive mb-4">Error loading more posts</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content: Posts & Charts */}
            <div className="lg:col-span-8 space-y-8">
              {statistics && (
                <>
                  <motion.div variants={itemVariants}>
                    <TagTrendChart data={statistics.monthlyTrend} />
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div variants={itemVariants}>
                      <TagCorrelationChart data={statistics.relatedTags} />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <PostDistributionHeatmap data={statistics.postDistribution} />
                    </motion.div>
                  </div>
                </>
              )}

              <motion.div variants={itemVariants} className="pt-8">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Latest Articles</h2>
                  <div className="h-px flex-1 bg-border/50" />
                </div>

                {posts.length > 0 ? (
                  <>
                    <PostsGrid posts={posts} />
                    {hasMore && (
                      <div className="text-center py-12">
                        <button
                          onClick={loadMore}
                          disabled={loading}
                          className="px-6 py-3 rounded-xl bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
                        >
                          {loading ? 'Loading...' : 'Load More Articles'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No posts found.</div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
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

              {allTags.length > 0 && (
                <motion.div variants={itemVariants}>
                  {/* Using enhanced cloud card with new styling */}
                  <TagCloudCard tags={allTags} maxTags={30} />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
