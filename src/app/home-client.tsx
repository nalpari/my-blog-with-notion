'use client'

import { useState, useEffect, useRef } from 'react'
import type { Post } from '@/types/notion'
import { PostCard } from '@/components/post-card'
import { PostsLoading } from '@/components/posts/PostsLoading'
import { MESSAGES } from '@/config/messages'
import { Button } from '@/components/ui/button'

export function HomeClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  // 공통 fetch 헬퍼 함수 - AbortSignal을 매개변수로 받음
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
    // 새 컨트롤러 생성 전 기존 요청 취소
    if (controllerRef.current) {
      controllerRef.current.abort()
    }

    const controller = new AbortController()
    controllerRef.current = controller

    fetchPosts(controller.signal)

    // 컴포넌트 언마운트 시 정리
    return () => {
      controller.abort()
      if (controllerRef.current === controller) {
        controllerRef.current = null
      }
    }
  }, [])

  const handleRetry = () => {
    // 이전 요청이 있다면 취소
    if (controllerRef.current) {
      controllerRef.current.abort()
    }

    // 새 컨트롤러 생성 및 저장
    const controller = new AbortController()
    controllerRef.current = controller

    fetchPosts(controller.signal)
  }

  if (loading) {
    return <PostsLoading count={9} />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          {MESSAGES.ERROR_LOADING_POSTS}
        </p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={handleRetry}>
          다시 시도
        </Button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{MESSAGES.NO_POSTS}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {posts.map((post: Post, index: number) => (
        <div
          key={post.id}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <PostCard post={post} priority={index < 3} />
        </div>
      ))}
    </div>
  )
}
