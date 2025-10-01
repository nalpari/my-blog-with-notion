'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import cloud from 'd3-cloud'
import type { Tag } from '@/types/notion'
import { cn } from '@/lib/utils'

interface EnhancedTagCloudProps {
  tags: Array<Tag & { count: number }>
  className?: string
}

interface CloudWord {
  text: string
  size: number
  x?: number
  y?: number
  rotate?: number
  tag: Tag & { count: number }
}

export function EnhancedTagCloud({ tags, className }: EnhancedTagCloudProps) {
  const router = useRouter()
  const svgRef = React.useRef<SVGSVGElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null)
  const [cloudWords, setCloudWords] = React.useState<CloudWord[]>([])
  const [canvasStatus, setCanvasStatus] = React.useState<'unknown' | 'supported' | 'unsupported'>('unknown')
  const [textColor, setTextColor] = React.useState('#71717a')
  const [primaryColor, setPrimaryColor] = React.useState('#8b5cf6')

  // 다크모드 색상 감지
  React.useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setTextColor(isDark ? '#a1a1aa' : '#71717a')
      setPrimaryColor(isDark ? '#8b5cf6' : '#7c3aed')
    }

    updateColors()

    const observer = new MutationObserver(updateColors)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // 태그를 클라우드 단어로 변환
  const words: CloudWord[] = React.useMemo(() => {
    if (tags.length === 0) {
      return []
    }

    const counts = tags.map((t) => t.count)
    const maxCount = Math.max(...counts)
    const minCount = Math.min(...counts)
    const range = maxCount - minCount || 1

    return tags.map((tag) => ({
      text: tag.name,
      size: 14 + ((tag.count - minCount) / range) * 46, // 14px ~ 60px
      tag,
    }))
  }, [tags])

  // 캔버스 지원 여부 확인 (테스트 환경/SSR 대비)
  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext?.('2d')
      if (!context || typeof context.getImageData !== 'function') {
        setCanvasStatus('unsupported')
        return
      }
      setCanvasStatus('supported')
    } catch (error) {
      console.warn('⚠️ Canvas not supported, falling back to simplified tag list.', error)
      setCanvasStatus('unsupported')
    }
  }, [])

  // d3-cloud 레이아웃 생성 및 실행
  React.useEffect(() => {
    if (canvasStatus !== 'supported' || !containerRef.current || words.length === 0) {
      if (canvasStatus === 'unsupported') {
        setCloudWords([])
      }
      return
    }

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Cleanup flag to prevent setState after unmount
    let isMounted = true

    const layout = cloud<CloudWord>()
      .size([width, height])
      .words(words)
      .padding(4)
      .rotate((_, i) => {
        const hash = words[i]?.text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0
        return hash % 10 < 3 ? -90 : 0
      })
      .font('system-ui, -apple-system, sans-serif')
      .fontSize((d) => d.size)
      .spiral('archimedean')
      .on('end', (computedWords) => {
        // Only update state if component is still mounted
        if (isMounted) {
          setCloudWords(computedWords as CloudWord[])
        }
      })

    layout.start()

    // Cleanup: stop layout and mark as unmounted
    return () => {
      isMounted = false
      layout.stop()
    }
  }, [words, canvasStatus])

  const handleWordClick = (tag: Tag & { count: number }) => {
    router.push(`/tags/${tag.slug}`)
  }

  const handleWordMouseEnter = (text: string) => {
    setSelectedTag(text)
  }

  const handleWordMouseLeave = () => {
    setSelectedTag(null)
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative w-full h-[400px] rounded-xl overflow-hidden',
        'bg-gradient-to-br from-background/50 to-muted/30',
        'backdrop-blur-sm border border-border/50',
        'shadow-lg hover:shadow-xl transition-shadow duration-300',
        className
      )}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
        {canvasStatus === 'supported' ? (
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            <g transform={`translate(${containerRef.current?.clientWidth ? containerRef.current.clientWidth / 2 : 0}, ${containerRef.current?.clientHeight ? containerRef.current.clientHeight / 2 : 0})`}>
              {cloudWords.map((word, index) => {
                const isSelected = selectedTag === word.text
                return (
                  <motion.text
                    key={`${word.text}-${index}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02, duration: 0.5 }}
                    style={{
                      fontSize: `${word.size}px`,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: 600,
                      transform: `translate(${word.x}px, ${word.y}px) rotate(${word.rotate}deg)`,
                      cursor: 'pointer',
                      userSelect: 'none',
                      fill: isSelected ? primaryColor : textColor,
                      opacity: isSelected ? 1 : 0.7,
                    }}
                    className="transition-all duration-200 hover:opacity-100"
                    textAnchor="middle"
                    onClick={() => handleWordClick(word.tag)}
                    onMouseEnter={() => handleWordMouseEnter(word.text)}
                    onMouseLeave={handleWordMouseLeave}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.fill = primaryColor
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.fill = textColor
                      }
                    }}
                  >
                    {word.text}
                  </motion.text>
                )
              })}
            </g>
          </svg>
        ) : (
          <div
            data-testid="tag-cloud-fallback"
            className="flex h-full w-full flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground"
          >
            {tags.slice(0, 30).map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleWordClick(tag)}
                className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent/50"
              >
                {tag.name}
                <span className="ml-1 text-muted-foreground">({tag.count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTag && canvasStatus === 'supported' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-lg"
        >
          <p className="text-sm font-medium text-popover-foreground">
            {selectedTag}
            <span className="ml-2 text-xs text-muted-foreground">
              {tags.find((t) => t.name === selectedTag)?.count}개의 포스트
            </span>
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

interface TagCloudCardProps {
  tags: Array<Tag & { count: number }>
  maxTags?: number
}

export function TagCloudCard({ tags, maxTags = 30 }: TagCloudCardProps) {
  const displayTags = React.useMemo(() => {
    return tags
      .slice()
      .sort((a, b) => b.count - a.count)
      .slice(0, maxTags)
  }, [tags, maxTags])

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <h2 className="text-lg font-semibold">태그 클라우드</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          크기가 클수록 많은 포스트가 있습니다
        </p>
      </div>
      
      <div className="p-6">
        <EnhancedTagCloud tags={displayTags} />
      </div>
    </div>
  )
}
