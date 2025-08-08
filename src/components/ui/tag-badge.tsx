import * as React from 'react'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types/notion'

// 태그 색상 매핑 - 더 세련된 색상으로 업데이트
const tagColorMap: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
  brown: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/70',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/70',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/70',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/70',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/70',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70',
}

interface TagBadgeProps {
  tag: Tag
  size?: 'sm' | 'md'
  className?: string
}

export function TagBadge({ tag, size = 'sm', className }: TagBadgeProps) {
  const colorClass = tagColorMap[tag.color] || tagColorMap.default
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-200 cursor-default select-none',
        'border border-transparent',
        colorClass,
        sizeClass,
        className,
      )}
      title={tag.name}
    >
      {tag.name}
    </span>
  )
}

interface TagListProps {
  tags: Tag[]
  maxTags?: number
  size?: 'sm' | 'md'
  className?: string
}

export function TagList({ tags, maxTags = 3, size = 'sm', className }: TagListProps) {
  if (!tags || tags.length === 0) return null

  const displayTags = tags.slice(0, maxTags)
  const remainingCount = tags.length - maxTags

  return (
    <div className={cn('flex flex-wrap gap-1.5 items-center', className)}>
      {displayTags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} size={size} />
      ))}
      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full bg-muted/80 text-muted-foreground font-medium',
            'border border-border/50 transition-colors duration-200',
            'hover:bg-muted hover:text-foreground',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
          )}
          title={`${remainingCount}개의 추가 태그`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  )
}