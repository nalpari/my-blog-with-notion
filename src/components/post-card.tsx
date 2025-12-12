/**
 * @fileoverview PostCard 컴포넌트 - 블로그 포스트를 카드 형태로 표시
 * 
 * 주요 기능:
 * - 반응형 카드 레이아웃으로 포스트 정보 표시
 * - 이미지 최적화 및 lazy loading 지원
 * - 호버 효과와 트랜지션 애니메이션
 * - 태그 시스템 통합
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getImageSizes } from '@/lib/image-utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TagList } from '@/components/ui/tag-badge'
import type { Post } from '@/types/notion'
import { formatDate } from '@/lib/date-utils'
import { ArrowUpRight } from 'lucide-react'

interface PostCardProps {
  post: Post
  priority?: boolean
}

/**
 * 블로그 포스트를 카드 형태로 표시하는 컴포넌트
 */
export function PostCard({ post, priority = false }: PostCardProps) {
  return (
    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-border/80 transition-all duration-300 h-full flex flex-col shadow-none hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5">
      <Link
        href={`/posts/${post.slug}`}
        className="block relative aspect-[16/9] overflow-hidden bg-muted/50"
        aria-label={`${post.title} 포스트 세부 보기`}
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
            sizes={getImageSizes('card')}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <div className="w-12 h-12 rounded-full border-2 border-current opacity-20" />
          </div>
        )}
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-300" />
      </Link>

      <CardHeader className="p-5 pb-3 space-y-3 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={post.publishedAt} className="font-medium">
            {formatDate(post.publishedAt)}
          </time>
          {post.category && (
            <>
              <span className="text-border">•</span>
              <span className="font-medium text-foreground/80">
                {post.category.name}
              </span>
            </>
          )}
        </div>

        <Link href={`/posts/${post.slug}`} className="block group/title">
          <CardTitle className="text-xl leading-tight font-semibold tracking-tight group-hover/title:text-foreground/80 transition-colors line-clamp-2">
            {post.title}
          </CardTitle>
        </Link>

        <CardDescription className="line-clamp-3 text-sm leading-relaxed text-muted-foreground/80">
          {post.excerpt}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0 mt-auto">
        {post.tags && post.tags.length > 0 && (
          <div className="mb-4">
            <TagList
              tags={post.tags}
              maxTags={3}
              size="sm"
              clickable
              className="opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <span className="text-xs font-medium text-muted-foreground">
            {post.readingTime}분 읽기
          </span>
          <Link
            href={`/posts/${post.slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors"
          >
            읽기
            <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
