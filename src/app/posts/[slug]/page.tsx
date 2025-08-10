import { notFound } from 'next/navigation'
import { getPostBySlug, getPostBlocks, getPublishedPosts } from '@/lib/notion'
import { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'

import { POSTS_CONFIG } from '@/config/constants'
import { MESSAGES } from '@/config/messages'

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto mt-16 lg:mt-32 xl:relative px-4 sm:px-6 lg:px-8">
        <article>
          <header className="flex flex-col">
            {/* 첫 번째 줄: 날짜, 작성자, 읽기 시간, 단어 수 */}
            <div className="flex items-center gap-4 text-sm text-zinc-400 dark:text-zinc-500">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span>By {POSTS_CONFIG.DEFAULT_AUTHOR}</span>
              <span>{MESSAGES.READING_TIME(post.readingTime)}</span>
              <span>{POSTS_CONFIG.DEFAULT_WORD_COUNT} words</span>
            </div>

            {/* 제목 - 더 크게 */}
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-zinc-100 dark:text-zinc-100 sm:text-6xl leading-tight">
              {post.title}
            </h1>

            {/* 카테고리 태그들 - 어두운 배경 */}
            {(post.category || (post.tags && post.tags.length > 0)) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {post.category && (
                  <span className="bg-zinc-800 text-white px-4 py-2 rounded text-sm font-medium">
                    {post.category.name}
                  </span>
                )}
                {post.tags &&
                  post.tags.length > 0 &&
                  post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-transparent border border-zinc-600 text-zinc-300 px-4 py-2 rounded text-sm font-medium"
                    >
                      {tag.name}
                    </span>
                  ))}
              </div>
            )}
          </header>

          <div
            className="mt-8 pb-[100px] prose prose-sm prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 leading-7"
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
                      className="rounded-lg"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className}>{children}</code>
                  )
                },
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-zinc-600 dark:text-zinc-300 leading-7">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 text-zinc-600 dark:text-zinc-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 text-zinc-600 dark:text-zinc-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-accent pl-4 italic text-zinc-500 dark:text-zinc-400 my-4">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-accent hover:text-accent/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                    {children}
                  </td>
                ),
                img: ({ src, alt }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={typeof src === 'string' ? src : ''}
                    alt={alt || ''}
                    className="w-full h-auto max-w-full rounded-lg my-6 object-cover"
                    loading="lazy"
                  />
                ),
              }}
            >
              {content || post.excerpt || '콘텐츠를 불러오는 중...'}
            </ReactMarkdown>
          </div>
        </article>
      </div>
      <ScrollToTopButton />
      <Footer />
    </div>
  )
}
