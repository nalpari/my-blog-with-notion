import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import type {
  Post,
  Category,
  Tag,
  NotionDatabaseResponse,
} from '@/types/notion'

// Notion API 타입 정의
type NotionRichText = {
  plain_text: string
  href?: string | null
}

type NotionFile = {
  type: 'external' | 'file'
  external?: { url: string }
  file?: { url: string }
}

type NotionSelect = {
  id: string
  name: string
  color: string
}

type NotionPage = {
  id: string
  created_time: string
  last_edited_time: string
  properties: Record<string, unknown>
}

// 노션 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// Notion to Markdown 변환기
const n2m = new NotionToMarkdown({ notionClient: notion })

// 데이터베이스 ID
const DATABASE_ID = process.env.NOTION_DATABASE_ID!

/**
 * 노션 Rich Text를 일반 텍스트로 변환
 */
function extractPlainText(richText: NotionRichText[]): string {
  if (!richText || !Array.isArray(richText)) return ''
  return richText.map((text) => text.plain_text || '').join('')
}

/**
 * 노션 파일 URL 추출
 */
function extractFileUrl(files: NotionFile[]): string | undefined {
  if (!files || !Array.isArray(files) || files.length === 0) return undefined

  const file = files[0]
  if (file.type === 'external') {
    return file.external?.url
  } else if (file.type === 'file') {
    return file.file?.url
  }
  return undefined
}

/**
 * 노션 Select 프로퍼티를 Category/Tag로 변환
 */
function extractSelectProperty(select: NotionSelect | null): Category | null {
  if (!select) return null

  return {
    id: select.id || '',
    name: select.name || '',
    slug: select.name?.toLowerCase().replace(/\s+/g, '-') || '',
    color: select.color || 'default',
  }
}

/**
 * 노션 Multi-Select 프로퍼티를 Tag 배열로 변환
 */
function extractMultiSelectProperty(multiSelect: NotionSelect[]): Tag[] {
  if (!multiSelect || !Array.isArray(multiSelect)) return []

  return multiSelect.map((tag) => ({
    id: tag.id || '',
    name: tag.name || '',
    slug: tag.name?.toLowerCase().replace(/\s+/g, '-') || '',
    color: tag.color || 'default',
  }))
}

/**
 * 노션 페이지를 Post 객체로 변환
 */
function transformNotionPageToPost(page: NotionPage): Post {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties = page.properties as Record<string, any>

  // 기본 정보 추출
  const title = extractPlainText(properties.title?.title || [])
  const slug =
    extractPlainText(properties.slug?.rich_text || []) ||
    title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  const excerpt = extractPlainText(properties.excerpt?.rich_text || [])
  const coverImage = extractFileUrl(properties.coverImage?.files || [])
  const status = properties.status?.select?.name || 'Draft'

  // 카테고리 및 태그 추출
  const category = extractSelectProperty(properties.category?.select) || {
    id: 'default',
    name: 'Uncategorized',
    slug: 'uncategorized',
    color: 'default',
  }
  const tags = extractMultiSelectProperty(properties.tags?.multi_select || [])

  // 날짜 정보 추출
  const createdAt = page.created_time
  const updatedAt = page.last_edited_time
  const publishedAt = properties.publishedAt?.date?.start || createdAt

  // 읽기 시간 추출
  const readingTime = properties.readingTime?.number || 5

  return {
    id: page.id,
    title,
    slug,
    excerpt,
    coverImage,
    status: status as 'Draft' | 'Published' | 'Archived',
    category,
    tags,
    createdAt,
    updatedAt,
    publishedAt,
    readingTime,
  }
}

/**
 * 노션 데이터베이스에서 게시된 포스트 목록 가져오기
 */
export async function getPublishedPosts(
  limit: number = 10,
  startCursor?: string,
): Promise<NotionDatabaseResponse> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'status',
        select: {
          equals: 'Published',
        },
      },
      sorts: [
        {
          property: 'publishedAt',
          direction: 'descending',
        },
      ],
      page_size: limit,
      start_cursor: startCursor,
    })

    const posts = response.results.map((page) =>
      transformNotionPageToPost(page as NotionPage),
    )

    return {
      posts,
      hasMore: response.has_more,
      nextCursor: response.next_cursor || undefined,
    }
  } catch (error) {
    console.error('Error fetching posts from Notion:', error)
    return {
      posts: [],
      hasMore: false,
    }
  }
}

/**
 * 최신 포스트 가져오기 (메인 페이지용)
 */
export async function getLatestPosts(limit: number = 3): Promise<Post[]> {
  const response = await getPublishedPosts(limit)
  return response.posts
}

/**
 * 슬러그로 특정 포스트 가져오기
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'slug',
            rich_text: {
              equals: slug,
            },
          },
          {
            property: 'status',
            select: {
              equals: 'Published',
            },
          },
        ],
      },
    })

    if (response.results.length === 0) {
      return null
    }

    return transformNotionPageToPost(response.results[0] as NotionPage)
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return null
  }
}

/**
 * 포스트의 블록 콘텐츠 가져오기
 */
export async function getPostBlocks(pageId: string) {
  try {
    const mdblocks = await n2m.pageToMarkdown(pageId)
    const mdString = n2m.toMarkdownString(mdblocks)
    return mdString.parent
  } catch (error) {
    console.error('Error fetching post blocks:', error)
    return ''
  }
}

/**
 * 카테고리별 포스트 가져오기
 */
export async function getPostsByCategory(
  categoryName: string,
  limit: number = 10,
): Promise<Post[]> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'category',
            select: {
              equals: categoryName,
            },
          },
          {
            property: 'status',
            select: {
              equals: 'Published',
            },
          },
        ],
      },
      sorts: [
        {
          property: 'publishedAt',
          direction: 'descending',
        },
      ],
      page_size: limit,
    })

    return response.results.map((page) =>
      transformNotionPageToPost(page as NotionPage),
    )
  } catch (error) {
    console.error('Error fetching posts by category:', error)
    return []
  }
}
