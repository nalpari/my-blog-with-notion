/**
 * @fileoverview PostCard 컴포넌트 - 모던하고 깔끔한 블로그 포스트 카드
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getImageSizes } from '@/lib/image-utils'
import { TagList } from '@/components/ui/tag-badge'
import type { Post } from '@/types/notion'
import { formatDate } from '@/lib/date-utils'
import { Calendar, Clock, ArrowUpRight } from 'lucide-react'

interface PostCardProps {
  post: Post
  priority?: boolean
}

export function PostCard({ post, priority = false }: PostCardProps) {
  return (
    <article className="group relative h-full">
      <Link
        href={`/posts/${post.slug}`}
        className="block h-full"
        aria-label={`${post.title} 포스트 읽기`}
      >
        <div className="relative h-full rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
          {/* 커버 이미지 */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {post.coverImage ? (
              <Image
                src={`/api/cover-image/${post.id}`}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={getImageSizes('card')}
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-accent/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
              </div>
            )}
            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* 카테고리 배지 */}
            {post.category && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
                  {post.category.name}
                </span>
              </div>
            )}
            {/* 화살표 아이콘 */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-accent-foreground" />
              </div>
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="p-5 sm:p-6">
            {/* 메타 정보 */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}분
              </span>
            </div>

            {/* 제목 */}
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
              {post.title}
            </h3>

            {/* 요약 */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {post.excerpt}
            </p>

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <TagList
                  tags={post.tags}
                  maxTags={3}
                  size="sm"
                  clickable={false}
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
