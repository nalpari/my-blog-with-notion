'use client'

import Link from 'next/link'
import Image from 'next/image'
import { optimizeNotionImageUrl, getImageSizes } from '@/lib/image-utils'
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

interface PostCardProps {
  post: Post
  priority?: boolean
}

export function PostCard({ post, priority = false }: PostCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden p-0 h-full">
        <Link href={`/posts/${post.slug}`} className="block">
          {post.coverImage && (
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={optimizeNotionImageUrl(post.coverImage) || post.coverImage}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes={getImageSizes('card')}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
          )}
          {!post.coverImage && (
            <div className="relative h-48 w-full overflow-hidden bg-muted flex items-center justify-center">
              <div className="text-muted-foreground">
                <svg
                  className="w-12 h-12"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </Link>
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span>{formatDate(post.publishedAt)}</span>
            {post.category && (
              <>
                <span>•</span>
                <span className="bg-accent/10 text-accent px-2 py-1 rounded-md text-xs font-medium">
                  {post.category.name}
                </span>
              </>
            )}
          </div>
          <Link href={`/posts/${post.slug}`} className="block">
            <CardTitle className="text-lg group-hover:text-accent transition-colors line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">
              {post.title}
            </CardTitle>
          </Link>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-2">
              <TagList tags={post.tags} maxTags={3} size="sm" clickable />
            </div>
          )}
          <CardDescription className="line-clamp-3 mt-2">
            {post.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {post.readingTime}분 읽기
            </span>
            <Link 
              href={`/posts/${post.slug}`}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-accent hover:text-white hover:bg-accent rounded-md transition-colors"
            >
              읽기 →
            </Link>
          </div>
        </CardContent>
      </Card>
  )
}