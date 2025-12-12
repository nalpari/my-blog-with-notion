'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TagBadge } from '@/components/ui/tag-badge'
import type { Tag } from '@/types/notion'

interface TagHeroSectionProps {
  tag: Tag
  postCount: number
  description?: string
}

// ... imports

export function TagHeroSection({ tag, postCount, description }: TagHeroSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 shadow-2xl shadow-primary/5 backdrop-blur-xl"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 p-8 md:p-12">
        <Link
          href="/tags"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Back to all topics
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-shrink-0"
          >
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center shadow-inner">
              <span className="text-4xl">#</span>
            </div>
          </motion.div>

          <div className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {tag.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/10">
                  Topic
                </span>
                <span className="text-sm text-muted-foreground">
                  {postCount} articles found
                </span>
              </div>
            </div>

            {description ? (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {description}
              </p>
            ) : (
              <p className="text-lg text-muted-foreground leading-relaxed">
                Browse all articles and insights related to <span className="font-medium text-foreground">{tag.name}</span>.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface RelatedTagsCardProps {
  tags: Array<Tag & { correlation: number; count: number }>
  maxTags?: number
}

export function RelatedTagsCard({ tags, maxTags = 8 }: RelatedTagsCardProps) {
  const displayTags = React.useMemo(() => {
    return tags
      .slice()
      .sort((a, b) => b.correlation - a.correlation)
      .slice(0, maxTags)
  }, [tags, maxTags])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-sm"
    >
      <div className="p-6 border-b border-border/50 bg-muted/30">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Related Topics</h2>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Frequently used together
        </p>
      </div>

      <div className="p-6 space-y-3">
        {displayTags.map((tag, index) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
          >
            <Link
              href={`/tags/${tag.slug}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1">
                <TagBadge tag={tag} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{tag.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tag.count}개 포스트
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {(() => {
                    const rawCorrelation =
                      typeof tag.correlation === 'number' && Number.isFinite(tag.correlation)
                        ? tag.correlation
                        : 0
                    const clampedPercent = Math.min(100, Math.max(0, rawCorrelation * 100))

                    return (
                      <>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${clampedPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {Math.round(clampedPercent)}%
                        </span>
                      </>
                    )
                  })()}
                </div>

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
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

interface TopPostsCardProps {
  posts: Array<{
    id: string
    title: string
    slug: string
    excerpt?: string
    publishedAt: string
  }>
  maxPosts?: number
}

export function TopPostsCard({ posts, maxPosts = 5 }: TopPostsCardProps) {
  const displayPosts = React.useMemo(() => {
    return posts.slice(0, maxPosts)
  }, [posts, maxPosts])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-sm"
    >
      <div className="p-6 border-b border-border/50 bg-muted/30">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Popular Articles</h2>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Must-read posts in this topic
        </p>
      </div>

      <div className="divide-y divide-border">
        {displayPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
          >
            <Link
              href={`/posts/${post.slug}`}
              className="block p-4 hover:bg-accent transition-colors group"
            >
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <time className="mt-2 text-xs text-muted-foreground block">
                {new Date(post.publishedAt).toLocaleDateString('ko-KR')}
              </time>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
