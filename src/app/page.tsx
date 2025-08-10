import { Suspense } from 'react'
import Link from 'next/link'
import { getLatestPosts } from '@/lib/notion'
import type { Post } from '@/types/notion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PostCard } from '@/components/post-card'
import { MESSAGES } from '@/config/messages'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card'

// 포스트 목록 컴포넌트
async function PostsList() {
  try {
    const posts = await getLatestPosts()

    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {MESSAGES.NO_POSTS}
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: Post, index: number) => (
          <PostCard key={post.id} post={post} priority={index === 0} />
        ))}
      </div>
    )
  } catch (error) {
    console.error('포스트를 불러오는 중 오류가 발생했습니다:', error)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {MESSAGES.ERROR_LOADING_POSTS}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {MESSAGES.ERROR_ENV_VARS}
        </p>
      </div>
    )
  }
}

// 로딩 컴포넌트
function PostsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
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

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Featured Posts */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl mb-4">최신 글</h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              개발과 기술에 대한 최신 인사이트를 확인해보세요
            </p>
          </div>

          <Suspense fallback={<PostsLoading />}>
            <PostsList />
          </Suspense>

          {/* 모든 포스트 보기 버튼 */}
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
        </div>
      </section>

      <Footer />
    </div>
  )
}
