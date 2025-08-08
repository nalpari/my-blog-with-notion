import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getLatestPosts } from '@/lib/notion'
import type { Post } from '@/types/notion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TagList } from '@/components/ui/tag-badge'

// 포스트 카드 컴포넌트
function PostCard({ post }: { post: Post }) {
  console.log(post)
  const formatDate = (dateString: string) => {
    return new Date(dateString)
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\. /g, '.')
      .replace(/\.$/, '')
  }

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

// 포스트 목록 컴포넌트
async function PostsList() {
  try {
    const posts = await getLatestPosts()

    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            아직 게시된 포스트가 없습니다.
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    )
  } catch (error) {
    console.error('포스트를 불러오는 중 오류가 발생했습니다:', error)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          포스트를 불러오는 중 오류가 발생했습니다.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          환경 변수 설정을 확인해주세요.
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
        </div>
      </section>

      <Footer />
    </div>
  )
}
