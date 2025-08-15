'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Post } from '@/types/notion'
import { PostCard } from '@/components/post-card'
import { MESSAGES } from '@/config/messages'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card'

function PostsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <Card key={i} className="overflow-hidden p-0">
          <div className="relative h-48 w-full bg-muted animate-pulse" />
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <span>•</span>
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-full bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

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
        signal
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
        setError(error instanceof Error ? error.message : '포스트를 불러오는데 실패했습니다')
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
    return <PostsLoading />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          {MESSAGES.ERROR_LOADING_POSTS}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {error}
        </p>
        <Button variant="outline" onClick={handleRetry}>
          다시 시도
        </Button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {MESSAGES.NO_POSTS}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: Post, index: number) => (
          <PostCard key={post.id} post={post} priority={index === 0} />
        ))}
      </div>
      
      <div className="text-center mt-12">
        <Button variant="outline" size="lg" className="gap-2" asChild>
          <Link href="/posts">
            모든 포스트 보기
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </Button>
      </div>
    </>
  )
}