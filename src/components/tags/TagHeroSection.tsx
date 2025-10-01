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

export function TagHeroSection({ tag, postCount, description }: TagHeroSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/30 shadow-xl"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />

      <div className="relative z-10 p-8 md:p-12">
        <Link
          href="/tags"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
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

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <TagBadge tag={tag} size="lg" className="text-2xl px-6 py-3" />
            </motion.div>

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {tag.name}
              </h1>
              
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                  <span className="font-semibold text-foreground">{postCount}</span>
                  <span>개의 포스트</span>
                </div>
              </div>
            </div>
          </div>

          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground max-w-2xl"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/20 to-transparent rounded-tl-full blur-3xl" />
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
      className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm"
    >
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <h2 className="text-lg font-semibold">연관 태그</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          함께 자주 사용되는 태그
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
      className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm"
    >
      <div className="p-6 border-b border-border bg-gradient-to-r from-secondary/5 to-secondary/10">
        <h2 className="text-lg font-semibold">인기 포스트</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          이 태그의 추천 포스트
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
