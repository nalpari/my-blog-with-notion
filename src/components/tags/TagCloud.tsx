'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types/notion'

/**
 * Editorial-style Tag Cloud Component
 * 에디토리얼 매거진 스타일의 태그 클라우드
 */

interface TagCloudProps {
  tags: Array<Tag & { count: number }>
  maxTags?: number
  className?: string
  variant?: 'cloud' | 'list'
}

// 태그 색상 팔레트 - 세련된 그라데이션 조합
const TAG_GRADIENTS = [
  'from-rose-500/90 to-orange-400/90',
  'from-violet-500/90 to-purple-400/90',
  'from-cyan-500/90 to-blue-400/90',
  'from-emerald-500/90 to-teal-400/90',
  'from-amber-500/90 to-yellow-400/90',
  'from-pink-500/90 to-rose-400/90',
  'from-indigo-500/90 to-violet-400/90',
  'from-teal-500/90 to-cyan-400/90',
]

function getTagGradient(index: number): string {
  return TAG_GRADIENTS[index % TAG_GRADIENTS.length]
}

export function TagCloud({ tags, maxTags, className, variant = 'cloud' }: TagCloudProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags

  const maxCount = Math.max(...displayTags.map(t => t.count), 1)
  const minCount = Math.min(...displayTags.map(t => t.count), 0)

  const getTagWeight = (count: number): number => {
    if (maxCount === minCount) return 0.5
    return (count - minCount) / (maxCount - minCount)
  }

  // 리스트 형태 - 2열 그리드 카드
  if (variant === 'list') {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
        {displayTags.map((tag, index) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 transition-all duration-300 hover:border-border hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* 배경 그라데이션 오버레이 */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-5',
              getTagGradient(index)
            )} />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 태그 아이콘 */}
                <div className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110',
                  getTagGradient(index)
                )}>
                  <span className="text-lg font-bold">
                    {tag.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-foreground/80">
                    {tag.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tag.count}개의 포스트
                  </p>
                </div>
              </div>

              {/* 화살표 아이콘 */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all duration-300 group-hover:bg-foreground group-hover:text-background">
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  // 클라우드 형태 - 동적 크기 버블
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {displayTags.map((tag, index) => {
        const weight = getTagWeight(tag.count)
        const baseSize = 12 + weight * 8 // 12px ~ 20px
        const padding = weight > 0.5 ? 'px-5 py-2.5' : 'px-4 py-2'

        return (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className={cn(
              'group relative inline-flex items-center gap-2 rounded-full border border-border/50 bg-card transition-all duration-300',
              'hover:border-transparent hover:shadow-lg hover:-translate-y-0.5',
              padding,
            )}
            style={{
              animationDelay: `${index * 30}ms`,
            }}
          >
            {/* 호버 시 그라데이션 배경 */}
            <div className={cn(
              'absolute inset-0 rounded-full bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100',
              getTagGradient(index)
            )} />

            <span
              className="relative z-10 font-medium text-foreground transition-colors duration-300 group-hover:text-white"
              style={{ fontSize: `${baseSize}px` }}
            >
              {tag.name}
            </span>

            <span
              className="relative z-10 rounded-full bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground transition-all duration-300 group-hover:bg-white/20 group-hover:text-white"
            >
              {tag.count}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

/**
 * Tag Page Header
 */
interface TagHeaderProps {
  totalTags: number
  totalPosts: number
}

export function TagHeader({ totalTags, totalPosts }: TagHeaderProps) {
  return (
    <div className="relative">
      {/* 배경 장식 */}
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-accent/20 to-transparent blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-violet-500/10 to-transparent blur-2xl" />

      <div className="relative space-y-8">
        {/* 라벨 */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-1.5 backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Browse Topics
          </span>
        </div>

        {/* 타이틀 */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">
              모든 태그
            </span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            다양한 주제를 탐색하고 관심있는 토픽의 포스트를 발견하세요
          </p>
        </div>

        {/* 통계 */}
        <div className="flex flex-wrap gap-6">
          <div className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 px-5 py-3 backdrop-blur-sm transition-all hover:border-accent/30 hover:shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/70 text-white shadow-lg shadow-accent/25">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalTags}</p>
              <p className="text-xs font-medium text-muted-foreground">토픽</p>
            </div>
          </div>

          <div className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 px-5 py-3 backdrop-blur-sm transition-all hover:border-violet-500/30 hover:shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalPosts}</p>
              <p className="text-xs font-medium text-muted-foreground">포스트</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Individual Tag Page Header
 */
interface TagPageHeaderProps {
  tag: Tag
  postCount: number
}

export function TagPageHeader({ tag, postCount }: TagPageHeaderProps) {
  return (
    <div className="relative">
      {/* 배경 장식 */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-accent/20 to-transparent blur-2xl" />

      <div className="relative space-y-6">
        {/* 브레드크럼 */}
        <Link
          href="/tags"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>모든 태그</span>
        </Link>

        {/* 태그 정보 */}
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/70 text-2xl font-bold text-white shadow-xl shadow-accent/25">
            {tag.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {tag.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {postCount}개의 포스트가 이 태그와 연결되어 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
