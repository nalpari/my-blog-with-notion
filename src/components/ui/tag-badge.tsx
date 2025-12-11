import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types/notion'

// Neo-Futurism tag color mapping with neon effects
const tagColorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  default: {
    bg: 'bg-[#00f5ff]/10',
    text: 'text-[#00f5ff]',
    border: 'border-[#00f5ff]/30',
    glow: 'hover:shadow-[0_0_10px_rgba(0,245,255,0.3)]',
  },
  gray: {
    bg: 'bg-[#8888aa]/10',
    text: 'text-[#8888aa]',
    border: 'border-[#8888aa]/30',
    glow: 'hover:shadow-[0_0_10px_rgba(136,136,170,0.3)]',
  },
  brown: {
    bg: 'bg-[#ff8800]/10',
    text: 'text-[#ff8800]',
    border: 'border-[#ff8800]/30',
    glow: 'hover:shadow-[0_0_10px_rgba(255,136,0,0.3)]',
  },
  orange: {
    bg: 'bg-[#ff8800]/10',
    text: 'text-[#ff8800]',
    border: 'border-[#ff8800]/30',
    glow: 'hover:shadow-[0_0_10px_rgba(255,136,0,0.3)]',
  },
  yellow: {
    bg: 'bg-[#ffd700]/10',
    text: 'text-[#ffd700]',
    border: 'border-[#ffd700]/30',
    glow: 'hover:shadow-[0_0_10px_rgba(255,215,0,0.3)]',
  },
  green: {
    bg: 'bg-[#00ff88]/10',
    text: 'text-[#00ff88]',
    border: 'border-[#00ff88]/30',
    glow: 'hover:shadow-[0_0_10px_rgba(0,255,136,0.3)]',
  },
  blue: {
    bg: 'bg-[#3b82f6]/10',
    text: 'text-[#3b82f6]',
    border: 'border-[#3b82f6]/30',
    glow: 'hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]',
  },
  purple: {
    bg: 'bg-[#a855f7]/10',
    text: 'text-[#a855f7]',
    border: 'border-[#a855f7]/30',
    glow: 'hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]',
  },
  pink: {
    bg: 'bg-[#ff6b9d]/10',
    text: 'text-[#ff6b9d]',
    border: 'border-[#ff6b9d]/30',
    glow: 'hover:shadow-[0_0_10px_rgba(255,107,157,0.3)]',
  },
  red: {
    bg: 'bg-[#ff4757]/10',
    text: 'text-[#ff4757]',
    border: 'border-[#ff4757]/30',
    glow: 'hover:shadow-[0_0_10px_rgba(255,71,87,0.3)]',
  },
}

interface TagBadgeProps {
  tag: Tag
  size?: 'sm' | 'md' | 'lg'
  className?: string
  clickable?: boolean
}

export function TagBadge({ tag, size = 'sm', className, clickable = false }: TagBadgeProps) {
  const colors = tagColorMap[tag.color] || tagColorMap.default
  const sizeClass =
    size === 'sm' ? 'px-2.5 py-1 text-xs' :
    size === 'md' ? 'px-3 py-1.5 text-sm' :
    'px-4 py-2 text-base'

  const badgeContent = (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-medium transition-all duration-300 select-none',
        'border backdrop-blur-sm',
        colors.bg,
        colors.text,
        colors.border,
        clickable && [
          'cursor-pointer hover:scale-105',
          colors.glow,
        ],
        !clickable && 'cursor-default',
        sizeClass,
        className,
      )}
      title={tag.name}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 opacity-80" style={{ backgroundColor: 'currentColor' }} />
      {tag.name}
    </span>
  )

  if (clickable) {
    return (
      <Link href={`/tags/${tag.slug}`} onClick={(e) => e.stopPropagation()}>
        {badgeContent}
      </Link>
    )
  }

  return badgeContent
}

interface TagListProps {
  tags: Tag[]
  maxTags?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  clickable?: boolean
}

export function TagList({ tags, maxTags = 3, size = 'sm', className, clickable = false }: TagListProps) {
  if (!tags || tags.length === 0) return null

  const displayTags = tags.slice(0, maxTags)
  const remainingCount = tags.length - maxTags

  return (
    <div className={cn('flex flex-wrap gap-2 items-center', className)}>
      {displayTags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} size={size} clickable={clickable} />
      ))}
      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-lg font-medium',
            'bg-[rgba(255,255,255,0.05)] text-muted-foreground',
            'border border-[rgba(255,255,255,0.1)]',
            'transition-all duration-300',
            'hover:bg-[rgba(255,255,255,0.1)] hover:text-foreground',
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
