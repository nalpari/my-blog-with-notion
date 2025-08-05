import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getLatestPosts } from '@/lib/notion'
import type { Post } from '@/types/notion'
import { ThemeToggle } from '@/components/theme-toggle'

// 포스트 카드 컴포넌트
function PostCard({ post }: { post: Post }) {
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
          <CardTitle className="group-hover:text-accent transition-colors line-clamp-2">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-3">
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
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">
                B
              </span>
            </div>
            <span className="font-semibold text-lg">Blog</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              홈
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              블로그
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              소개
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              연락
            </a>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-24">
        <div className="container text-center mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              모던하고 미니멀한
              <br />
              <span className="text-accent">개발자 블로그</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Linear.app에서 영감을 받은 깔끔하고 세련된 디자인으로 개발 경험과
              인사이트를 공유합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8"
              >
                최신 글 보기
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8">
                구독하기
              </Button>
            </div>
          </div>
        </div>
      </section>

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

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container max-w-3xl text-center mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl mb-4">뉴스레터 구독</h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8">
            새로운 글과 개발 인사이트를 이메일로 받아보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              className="flex-1"
            />
            <Button className="sm:w-auto">구독하기</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            언제든지 구독을 취소할 수 있습니다. 스팸은 보내지 않습니다.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-sm">
                    B
                  </span>
                </div>
                <span className="font-semibold text-lg">Blog</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                모던한 웹 개발과 디자인에 대한 인사이트를 공유하는 개발자
                블로그입니다.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  GitHub
                </Button>
                <Button variant="ghost" size="sm">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm">
                  LinkedIn
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">카테고리</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    React
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    TypeScript
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Next.js
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Design
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">링크</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    소개
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    연락
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    RSS
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    사이트맵
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Blog. Linear Design System을 기반으로 제작되었습니다.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
