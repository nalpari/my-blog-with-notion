'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types/notion'
import { TagBadge } from '@/components/ui/tag-badge'

interface TagCloudProps {
  tags: Array<Tag & { count: number }>
  maxTags?: number
  className?: string
  variant?: 'cloud' | 'list'
}

export function TagCloud({ tags, maxTags, className, variant = 'cloud' }: TagCloudProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags

  // 태그 크기 계산 (포스트 수에 따라)
  const maxCount = Math.max(...displayTags.map(t => t.count))
  const minCount = Math.min(...displayTags.map(t => t.count))
  
  const getTagSize = (count: number) => {
    if (maxCount === minCount) return 'md'
    const ratio = (count - minCount) / (maxCount - minCount)
    if (ratio > 0.7) return 'lg'
    if (ratio > 0.3) return 'md'
    return 'sm'
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        {displayTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <TagBadge tag={tag} size="md" />
              <span className="text-sm text-muted-foreground">
                {tag.count}개의 포스트
              </span>
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
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {displayTags.map((tag) => {
        const size = getTagSize(tag.count)
        const sizeClasses = {
          sm: 'text-sm px-3 py-1.5',
          md: 'text-base px-4 py-2',
          lg: 'text-lg px-5 py-2.5 font-medium',
        }[size]

        return (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className={cn(
              'group relative inline-flex items-center gap-2 rounded-full transition-all duration-200',
              'hover:scale-105 hover:shadow-md',
              sizeClasses,
            )}
          >
            <TagBadge 
              tag={tag} 
              size={size === 'lg' ? 'md' : 'sm'} 
              className="shadow-none border-0"
            />
            <span className="text-xs text-muted-foreground font-medium">
              {tag.count}
            </span>
            
            {/* 호버 시 툴팁 */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
              {tag.count}개의 포스트
            </div>
          </Link>
        )
      })}
    </div>
  )
}

interface TagHeaderProps {
  totalTags: number
  totalPosts: number
}

export function TagHeader({ totalTags, totalPosts }: TagHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">태그</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          모든 태그를 둘러보고 관심있는 주제의 포스트를 찾아보세요
        </p>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span>{totalTags}개의 태그</span>
        </div>
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
          <span>{totalPosts}개의 포스트</span>
        </div>
      </div>
    </div>
  )
}

interface TagPageHeaderProps {
  tag: Tag
  postCount: number
}

export function TagPageHeader({ tag, postCount }: TagPageHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/tags"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
      
      <div className="flex items-center gap-4">
        <TagBadge tag={tag} size="md" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tag.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {postCount}개의 포스트
          </p>
        </div>
      </div>
    </div>
  )
}