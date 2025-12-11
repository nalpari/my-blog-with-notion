'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Post } from '@/types/notion'
import { PostCard } from '@/components/post-card'
import { PostsLoading } from '@/components/posts/PostsLoading'
import { MESSAGES } from '@/config/messages'
import { Button } from '@/components/ui/button'
import { ArrowRight, RefreshCw } from 'lucide-react'

export function HomeClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const fetchPosts = async (signal: AbortSignal) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/posts?limit=9', {
        signal,
      })

      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`)
      }

      const data = await response.json()

      if (!signal.aborted) {
        setPosts(data.posts)
        setError(null)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('포스트를 불러오는 중 오류가 발생했습니다:', error)

      if (!signal.aborted) {
        setError(
          error instanceof Error
            ? error.message
            : '포스트를 불러오는데 실패했습니다',
        )
        setPosts([])
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort()
    }

    const controller = new AbortController()
    controllerRef.current = controller

    fetchPosts(controller.signal)

    return () => {
      controller.abort()
      if (controllerRef.current === controller) {
        controllerRef.current = null
      }
    }
  }, [])

  const handleRetry = () => {
    if (controllerRef.current) {
      controllerRef.current.abort()
    }

    const controller = new AbortController()
    controllerRef.current = controller

    fetchPosts(controller.signal)
  }

  if (loading) {
    return <PostsLoading count={9} />
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="glass-card inline-block p-8 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[#ff4757]/10 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#ff4757]" />
          </div>
          <p className="text-muted-foreground mb-2">
            {MESSAGES.ERROR_LOADING_POSTS}
          </p>
          <p className="text-sm text-muted-foreground/70 mb-6 font-[family-name:var(--font-mono)]">
            {error}
          </p>
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="glass-card inline-block p-8 rounded-2xl">
          <p className="text-muted-foreground">{MESSAGES.NO_POSTS}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {posts.map((post: Post, index: number) => (
          <div
            key={post.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <PostCard post={post} priority={index === 0} />
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center mt-16">
        <Button variant="neon" size="lg" className="gap-3 group" asChild>
          <Link href="/posts">
            <span className="relative z-10">모든 포스트 보기</span>
            <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </>
  )
}
