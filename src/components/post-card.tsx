'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
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
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden p-0 cursor-pointer h-full">
        {post.coverImage && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          <CardTitle className="text-lg group-hover:text-accent transition-colors line-clamp-2 overflow-hidden text-ellipsis">
            {post.title}
          </CardTitle>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-2">
              <TagList tags={post.tags} maxTags={3} size="sm" />
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
            <Button
              variant="ghost"
              size="sm"
              className="text-accent hover:text-white hover:bg-accent"
            >
              읽기 →
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}