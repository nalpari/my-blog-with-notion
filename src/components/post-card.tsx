/**
 * @fileoverview PostCard Component - Modern Blog Post Card
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getImageSizes } from '@/lib/image-utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TagList } from '@/components/ui/tag-badge'
import type { Post } from '@/types/notion'
import { formatDate } from '@/lib/date-utils'
import { motion } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'

interface PostCardProps {
  post: Post
  priority?: boolean
}

export function PostCard({ post, priority = false }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Link
        href={`/posts/${post.slug}`}
        className="block h-full group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        aria-label={`Read post: ${post.title}`}
      >
        <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-border/80 transition-all duration-300 overflow-hidden rounded-xl shadow-sm hover:shadow-md flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-[1.8/1] w-full overflow-hidden bg-muted/20">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={getImageSizes('card')}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                <span className="text-4xl font-bold opacity-10">{post.title.charAt(0)}</span>
              </div>
            )}

            {/* Category Badge - Overlay */}
            {post.category && (
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-background/80 backdrop-blur-md text-foreground shadow-sm">
                  {post.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <CardHeader className="p-6 pb-2 space-y-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{post.readingTime} min read</span>
              </div>
            </div>

            <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 pt-0 flex-grow flex flex-col justify-between">
            <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm mb-4">
              {post.excerpt}
            </p>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
              <div className="flex-1 overflow-hidden mr-4">
                {post.tags && post.tags.length > 0 && (
                  <TagList
                    tags={post.tags}
                    maxTags={2}
                    size="sm"
                    clickable={false}
                    className="flex-nowrap"
                  />
                )}
              </div>
              <span className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center">
                Read
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

