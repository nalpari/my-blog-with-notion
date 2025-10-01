import type { Post, Tag } from '@/types/notion'
import type {
  TagStatistics,
  MonthlyTrendData,
  RelatedTagData,
  PostDistributionData,
} from '@/types/tag-statistics'

export function calculateTagStatistics(
  posts: Post[],
  targetTagSlug: string
): TagStatistics {
  const monthlyTrend = calculateMonthlyTrend(posts)
  const relatedTags = calculateRelatedTags(posts, targetTagSlug)
  const postDistribution = calculatePostDistribution(posts)
  const topPosts = posts.slice(0, 5)

  return {
    monthlyTrend,
    relatedTags,
    postDistribution,
    topPosts,
  }
}

function calculateMonthlyTrend(posts: Post[]): MonthlyTrendData[] {
  const monthlyMap = new Map<string, number>()

  posts.forEach((post) => {
    const date = new Date(post.publishedAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1)
  })

  const sortedMonths = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)

  return sortedMonths.map(([month, count], index, array) => {
    const prevCount = index > 0 ? array[index - 1][1] : count
    const growthRate = prevCount > 0 ? ((count - prevCount) / prevCount) * 100 : 0

    return {
      month,
      count,
      growthRate,
    }
  })
}

function calculateRelatedTags(
  posts: Post[],
  targetTagSlug: string
): RelatedTagData[] {
  const tagCoOccurrence = new Map<string, { count: number; tag: Tag }>()
  const targetTagCount = posts.length

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      if (tag.slug === targetTagSlug) return

      if (!tagCoOccurrence.has(tag.slug)) {
        tagCoOccurrence.set(tag.slug, { count: 0, tag })
      }

      const data = tagCoOccurrence.get(tag.slug)!
      data.count += 1
    })
  })

  const relatedTagsArray = Array.from(tagCoOccurrence.values())
    .map((data) => ({
      tag: data.tag,
      correlation: data.count / targetTagCount,
      coOccurrenceCount: data.count,
    }))
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, 10)

  return relatedTagsArray
}

function calculatePostDistribution(posts: Post[]): PostDistributionData[] {
  const distributionMap = new Map<string, number>()

  posts.forEach((post) => {
    const date = new Date(post.publishedAt)
    const dateKey = date.toISOString().split('T')[0]
    distributionMap.set(dateKey, (distributionMap.get(dateKey) || 0) + 1)
  })

  const sortedDistribution = Array.from(distributionMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)

  return sortedDistribution.map(([date, posts]) => {
    const dateObj = new Date(date)
    return {
      date,
      posts,
      dayOfWeek: dateObj.getDay(),
    }
  })
}

export function getAllTagsWithCount(posts: Post[]): Array<Tag & { count: number }> {
  const tagCountMap = new Map<string, { tag: Tag; count: number }>()

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      if (!tagCountMap.has(tag.slug)) {
        tagCountMap.set(tag.slug, { tag, count: 0 })
      }
      const data = tagCountMap.get(tag.slug)!
      data.count += 1
    })
  })

  return Array.from(tagCountMap.values())
    .map((data) => ({ ...data.tag, count: data.count }))
    .sort((a, b) => b.count - a.count)
}
