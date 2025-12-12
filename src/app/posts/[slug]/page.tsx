import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPostBySlug, getPostBlocks, getPublishedPosts } from '@/lib/notion'
import { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { CommentsSection } from '@/components/comments/CommentsSection'
import { Badge } from '@/components/ui/badge'

import { POSTS_CONFIG } from '@/config/constants'
import { MESSAGES } from '@/config/messages'
import { calculateWordCount, calculateReadingTimeFromText } from '@/lib/word-count'
import { Clock, Calendar, Type } from 'lucide-react'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt || 'Blog post',
  }
}

export async function generateStaticParams() {
  const response = await getPublishedPosts(100) // 모든 게시된 포스트 가져오기

  return response.posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // 포스트 콘텐츠 가져오기
  const content = await getPostBlocks(post.id)

  // 실제 content 기반으로 읽기 시간과 단어 수 계산
  const wordCount = content ? calculateWordCount(content) : POSTS_CONFIG.DEFAULT_WORD_COUNT
  const readingTime = content ? calculateReadingTimeFromText(content) : post.readingTime

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-24 max-w-4xl">
        <article>
          <header className="mb-16 text-center">
            {/* 카테고리 & 태그 */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {post.category && (
                <Badge variant="secondary" className="px-3 py-1 text-sm bg-accent/10 text-accent hover:bg-accent/20 border-0">
                  {post.category.name}
                </Badge>
              )}
              {post.tags && post.tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-muted-foreground border-border/50">
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* 제목 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
              {post.title}
            </h1>

            {/* 메타 정보 */}
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-sm text-muted-foreground border-y border-border/40 py-6">
              <div className="flex items-center gap-2">
                {post.author?.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name || 'Author'}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                    {(post.author?.name || POSTS_CONFIG.DEFAULT_AUTHOR).charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-foreground">{post.author?.name || POSTS_CONFIG.DEFAULT_AUTHOR}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{readingTime}{MESSAGES.READING_TIME}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <Type className="w-4 h-4" />
                <span>{wordCount.toLocaleString()} {MESSAGES.WORD_COUNT}</span>
              </div>
            </div>
          </header>

          <div
            className="prose prose-zinc dark:prose-invert max-w-none 
              prose-headings:font-semibold prose-headings:tracking-tight 
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-pre:bg-zinc-900/95 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
              prose-img:rounded-xl prose-img:shadow-md
              prose-blockquote:border-l-accent prose-blockquote:bg-accent/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic
              leading-8 text-lg text-zinc-600 dark:text-zinc-300"
            data-mdx-content
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                code(props: any) {
                  const { inline, className, children } = props
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <div className="relative group">
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="!m-0 !rounded-xl !bg-zinc-900/95"
                        showLineNumbers={true}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground font-medium border border-border/50">{children}</code>
                  )
                },
                img: ({ src, alt }) => (
                  <figure className="my-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={typeof src === 'string' ? src : ''}
                      alt={alt || ''}
                      className="w-full h-auto rounded-xl border border-border/40 shadow-sm"
                      loading="lazy"
                    />
                    {alt && <figcaption className="text-center text-sm text-muted-foreground mt-3">{alt}</figcaption>}
                  </figure>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-8 rounded-lg border border-border/40">
                    <table className="min-w-full divide-y divide-border/40">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted/50">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-border/40 bg-card">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-muted/30 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {children}
                  </td>
                ),
              }}
            >
              {content || post.excerpt || '콘텐츠를 불러오는 중...'}
            </ReactMarkdown>
          </div>

          <div className="mt-20 pt-10 border-t border-border/40">
            <CommentsSection postSlug={slug} />
          </div>
        </article>
      </main>

      <ScrollToTopButton />
      <Footer />
    </div>
  )
}
