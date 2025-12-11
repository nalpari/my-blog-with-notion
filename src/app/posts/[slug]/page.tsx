import { notFound } from 'next/navigation'
import Link from 'next/link'
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

import { POSTS_CONFIG } from '@/config/constants'
import { MESSAGES } from '@/config/messages'
import { calculateReadingTimeFromText } from '@/lib/word-count'

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
  // const wordCount = content ? calculateWordCount(content) : POSTS_CONFIG.DEFAULT_WORD_COUNT
  const readingTime = content ? calculateReadingTimeFromText(content) : post.readingTime

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="container mx-auto mt-20 lg:mt-32 xl:relative px-4 sm:px-6 lg:px-8 max-w-4xl">
        <article>
          <header className="flex flex-col space-y-8 border-b border-border pb-8">
            {/* Back Link */}
            <Link href="/posts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 w-fit group">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Posts
            </Link>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-tight">
              {post.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {post.author?.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name || 'Author'}
                    width={48}
                    height={48}
                    className="rounded-full ring-2 ring-background"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center ring-2 ring-background">
                    <span className="text-muted-foreground font-semibold">
                      {(post.author?.name || POSTS_CONFIG.DEFAULT_AUTHOR).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-semibold text-foreground">
                    {post.author?.name || POSTS_CONFIG.DEFAULT_AUTHOR}
                  </div>
                  {post.author?.email && (
                    <div className="text-sm text-muted-foreground">{post.author.email}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <time dateTime={post.publishedAt} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(post.publishedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {readingTime}{MESSAGES.READING_TIME}
                </span>
              </div>
            </div>

            {/* Categories & Tags */}
            <div className="flex flex-wrap gap-2">
              {post.category && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {post.category.name}
                </span>
              )}
              {post.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm hover:bg-muted/80 transition-colors"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </header>

          <div
            className="mt-12 pb-24 prose prose-lg prose-neutral dark:prose-invert max-w-none text-foreground/90 leading-loose
            prose-headings:font-bold prose-headings:tracking-tight
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-img:rounded-xl prose-img:shadow-lg"
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
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-xl my-6 shadow-sm !bg-[#1e1e1e] !p-6"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm">{children}</code>
                  )
                },
                img: ({ src, alt }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src || ''}
                    alt={alt || ''}
                    className="w-full h-auto rounded-xl shadow-md my-8 border border-border/50"
                    loading="lazy"
                  />
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground my-8 bg-muted/20 p-4 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-8 rounded-lg border border-border shadow-sm">
                    <table className="min-w-full divide-y divide-border">
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
                  <tbody className="bg-background divide-y divide-border">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-muted/20 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {children}
                  </td>
                ),
              }}
            >
              {content || post.excerpt || '콘텐츠를 불러오는 중...'}
            </ReactMarkdown>
          </div>

          <CommentsSection postSlug={slug} />
        </article>
      </div>
      <ScrollToTopButton />
      <Footer />
    </div>
  )
}
