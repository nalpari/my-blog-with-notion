import { vi } from 'vitest'
import type { ReactNode } from 'react'

const mockUsePostsByTag = vi.fn()

vi.mock('@/hooks/usePostsByTag', () => ({
  usePostsByTag: (slug: string) => mockUsePostsByTag(slug),
}))

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ModernTagPage } from '@/app/tags/[slug]/modern-page'
import { TagTrendChart, TagCorrelationChart, PostDistributionHeatmap } from '@/components/tags/TagTrendChart'
import { RelatedTagsCard, TopPostsCard } from '@/components/tags/TagHeroSection'
import { TagCloudCard } from '@/components/tags/EnhancedTagCloud'
import type { Tag, Post, Category } from '@/types/notion'
import type { TagStatistics, MonthlyTrendData, RelatedTagData } from '@/types/tag-statistics'

const baseCategory: Category = {
  id: 'category-frontend',
  name: 'Frontend',
  slug: 'frontend',
  color: 'blue',
}

const baseTag: Tag = {
  id: 'tag-react',
  name: 'React',
  slug: 'react',
  color: 'blue',
}

const relatedTag: Tag = {
  id: 'tag-nextjs',
  name: 'Next.js',
  slug: 'nextjs',
  color: 'green',
}

const anotherRelatedTag: Tag = {
  id: 'tag-node',
  name: 'Node.js',
  slug: 'node',
  color: 'yellow',
}

const createPost = (override: Partial<Post> = {}): Post => ({
  id: 'post-1',
  title: 'React Suspense 심화 가이드',
  slug: 'react-suspense-guide',
  excerpt: 'React Suspense를 활용한 데이터 패칭 전략',
  coverImage: undefined,
  status: 'Published',
  category: baseCategory,
  tags: [baseTag],
  author: undefined,
  createdAt: '2024-08-01T00:00:00.000Z',
  updatedAt: '2024-08-01T00:00:00.000Z',
  publishedAt: '2024-08-01T00:00:00.000Z',
  readingTime: 7,
  ...override,
})

const monthlyTrend: MonthlyTrendData[] = [
  { month: '2025-06', count: 4, growthRate: 0.12 },
  { month: '2025-07', count: 6, growthRate: 0.3 },
]

const relatedTags: RelatedTagData[] = [
  { tag: relatedTag, correlation: 0.82, coOccurrenceCount: 12 },
  { tag: anotherRelatedTag, correlation: 0.54, coOccurrenceCount: 7 },
]

const statistics: TagStatistics = {
  monthlyTrend,
  relatedTags,
  postDistribution: [
    { date: '2025-07-01', posts: 2 },
    { date: '2025-07-02', posts: 4 },
    { date: '2025-07-07', posts: 1 },
    { date: '2025-07-08', posts: 3 },
  ],
  topPosts: [
    createPost({ id: 'top-1', title: 'Next.js 15 태그 성능 최적화', slug: 'next15-tag-performance' }),
    createPost({ id: 'top-2', title: 'React Server Components 모범 사례', slug: 'rsc-best-practices' }),
  ],
}

describe('ModernTagPage states', () => {
  beforeEach(() => {
    mockUsePostsByTag.mockReset()
  })

  it('로딩 상태에서 스켈레톤 UI를 렌더링한다', () => {
    mockUsePostsByTag.mockReturnValue({
      posts: [],
      loading: true,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    })

    const { container } = render(
      <ModernTagPage
        tag={baseTag}
        initialPostCount={0}
      />
    )

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('에러 상태에서 오류 메시지를 보여준다', () => {
    const refresh = vi.fn()

    mockUsePostsByTag.mockReturnValue({
      posts: [],
      loading: false,
      error: '네트워크 오류',
      hasMore: false,
      loadMore: vi.fn(),
      refresh,
    })

    render(
      <ModernTagPage
        tag={baseTag}
        initialPostCount={0}
      />
    )

    expect(screen.getByText('포스트를 불러올 수 없습니다')).toBeInTheDocument()
    expect(screen.getByText('네트워크 오류')).toBeInTheDocument()
  })

  it('성공 상태에서 차트, 리스트, 상호작용을 렌더링한다', async () => {
    const loadMore = vi.fn()
    const user = userEvent.setup()

    mockUsePostsByTag.mockReturnValue({
      posts: [createPost()],
      loading: false,
      error: null,
      hasMore: true,
      loadMore,
      refresh: vi.fn(),
    })

    render(
      <ModernTagPage
        tag={baseTag}
        initialPostCount={1}
        statistics={statistics}
        relatedTags={[
          { ...relatedTag, correlation: 0.82, count: 12 },
          { ...anotherRelatedTag, correlation: 0.54, count: 7 },
        ]}
        allTags={[
          { ...baseTag, count: 20 },
          { ...relatedTag, count: 15 },
        ]}
      />
    )

    expect(screen.getByRole('heading', { name: '포스트 트렌드' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '연관 태그 분석' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '포스트 활동 히트맵' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '포스트' })).toBeInTheDocument()

    const loadMoreButton = screen.getByRole('button', { name: '더 많은 포스트 보기' })
    await user.click(loadMoreButton)
    expect(loadMore).toHaveBeenCalledTimes(1)

    expect(screen.getByRole('heading', { name: '태그 클라우드' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '연관 태그' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '인기 포스트' })).toBeInTheDocument()
  })

  it('접근성 자동화 검사에서 위반 사항이 없어야 한다', async () => {
    mockUsePostsByTag.mockReturnValue({
      posts: [createPost()],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    })

    const { container } = render(
      <ModernTagPage
        tag={baseTag}
        initialPostCount={1}
        statistics={statistics}
        relatedTags={[
          { ...relatedTag, correlation: 0.82, count: 12 },
          { ...anotherRelatedTag, correlation: 0.54, count: 7 },
        ]}
        allTags={[
          { ...baseTag, count: 20 },
          { ...relatedTag, count: 15 },
        ]}
      />
    )

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})

describe('Tag chart components', () => {
  it('TagTrendChart가 월별 데이터를 시각화 레이아웃으로 변환한다', () => {
    render(<TagTrendChart data={monthlyTrend} />)

    expect(screen.getByText('포스트 트렌드')).toBeInTheDocument()
    expect(screen.getByText('월별 포스트 발행 추이')).toBeInTheDocument()
    expect(document.querySelector('linearGradient#colorPosts')).not.toBeNull()
  })

  it('TagCorrelationChart가 연관 태그 데이터를 퍼센트로 변환한다', () => {
    render(<TagCorrelationChart data={relatedTags} />)

    expect(screen.getByText('연관 태그 분석')).toBeInTheDocument()
    expect(screen.getByText('함께 사용된 태그와의 상관관계')).toBeInTheDocument()
    expect(screen.getByText('상관관계 (%)')).toBeInTheDocument()
  })

  it('PostDistributionHeatmap이 날짜 데이터를 주차별 히트맵으로 렌더링한다', () => {
    render(
      <PostDistributionHeatmap
        data={statistics.postDistribution}
      />
    )

    const heatCells = screen.getAllByTitle(/포스트/)
    expect(heatCells.length).toBeGreaterThanOrEqual(statistics.postDistribution.length)
    expect(screen.getByText('적음')).toBeInTheDocument()
    expect(screen.getByText('많음')).toBeInTheDocument()
  })
})

describe('Sidebar cards', () => {
  it('RelatedTagsCard가 상관관계 순으로 태그를 정렬하고 최대 개수만 보여준다', () => {
    render(
      <RelatedTagsCard
        tags={[
          { ...relatedTag, correlation: 0.6, count: 10 },
          { ...anotherRelatedTag, correlation: 0.9, count: 5 },
        ]}
        maxTags={1}
      />
    )

    expect(screen.getByRole('heading', { name: '연관 태그' })).toBeInTheDocument()
    expect(screen.getAllByText('Node.js').length).toBeGreaterThan(0)
    expect(screen.queryByText('Next.js')).not.toBeInTheDocument()
  })

  it('TopPostsCard가 최대 개수만큼 인기 포스트를 노출하고 날짜를 포맷한다', () => {
    render(
      <TopPostsCard
        posts={statistics.topPosts}
        maxPosts={1}
      />
    )

    expect(screen.getByRole('heading', { name: '인기 포스트' })).toBeInTheDocument()
    expect(screen.getByText('Next.js 15 태그 성능 최적화')).toBeInTheDocument()
    expect(screen.getByText(/2024|2025/)).toBeInTheDocument()
    expect(screen.queryByText('React Server Components 모범 사례')).not.toBeInTheDocument()
  })

  it('TagCloudCard가 Wordcloud 데이터를 전달한다', () => {
    render(
      <TagCloudCard
        tags={[
          { ...baseTag, count: 20 },
          { ...relatedTag, count: 10 },
        ]}
      />
    )

    expect(screen.getByRole('heading', { name: '태그 클라우드' })).toBeInTheDocument()
    expect(screen.getByTestId('tag-cloud-fallback')).toBeInTheDocument()
  })
})
