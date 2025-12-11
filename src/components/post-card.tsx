/**
 * @fileoverview Neo-Futurism PostCard Component
 *
 * Features:
 * - Glassmorphism card design
 * - Holographic hover effects
 * - Neon accent colors and glows
 * - Smooth animations and transitions
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getImageSizes } from '@/lib/image-utils'
import { TagList } from '@/components/ui/tag-badge'
import type { Post } from '@/types/notion'
import { formatDate } from '@/lib/date-utils'
import { Clock, ArrowUpRight, Calendar, Folder } from 'lucide-react'

interface PostCardProps {
  post: Post
  priority?: boolean
}

export function PostCard({ post, priority = false }: PostCardProps) {
  return (
    <article className="group relative h-full">
      {/* Card container with glass effect */}
      <div className="relative h-full glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#00f5ff]/30">
        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f5ff]/5 via-transparent to-[#a855f7]/5" />
          <div className="absolute -inset-1 bg-gradient-to-br from-[#00f5ff]/10 to-[#a855f7]/10 blur-xl opacity-50" />
        </div>

        {/* Image Section */}
        <Link
          href={`/posts/${post.slug}`}
          className="block relative overflow-hidden"
          aria-label={`${post.title} 포스트 세부 보기`}
        >
          {post.coverImage ? (
            <div className="relative h-48 w-full overflow-hidden">
              {/* Image overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10 opacity-60" />

              {/* Holographic shimmer on hover */}
              <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f5ff]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>

              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                sizes={getImageSizes('card')}
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
              />
            </div>
          ) : (
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#12121a] to-[#0a0a0f]">
              {/* Placeholder pattern */}
              <div className="absolute inset-0 cyber-grid opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00f5ff]/20 to-[#a855f7]/20 flex items-center justify-center">
                  <Folder className="w-8 h-8 text-[#00f5ff]/50" />
                </div>
              </div>
            </div>
          )}

          {/* Category badge - positioned on image */}
          {post.category && (
            <div className="absolute top-4 left-4 z-30">
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0a0a0f]/80 backdrop-blur-sm border border-[#00f5ff]/30 text-[#00f5ff]">
                {post.category.name}
              </span>
            </div>
          )}
        </Link>

        {/* Content Section */}
        <div className="relative p-6 space-y-4">
          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00f5ff]" />
              <span>{post.readingTime}분</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/posts/${post.slug}`} className="block group/title">
            <h3 className="text-lg font-semibold leading-snug line-clamp-2 transition-colors duration-300 group-hover/title:text-[#00f5ff]">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-2">
              <TagList
                tags={post.tags}
                maxTags={3}
                size="sm"
                clickable
              />
            </div>
          )}

          {/* Read more link */}
          <div className="pt-2">
            <Link
              href={`/posts/${post.slug}`}
              className="group/link inline-flex items-center gap-2 text-sm font-medium text-[#00f5ff] transition-all duration-300 hover:gap-3"
            >
              <span>자세히 읽기</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f5ff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </article>
  )
}
