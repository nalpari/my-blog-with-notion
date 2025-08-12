import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'
import type {
  Post,
  Category,
  Tag,
  Author,
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

type NotionPerson = {
  id: string
  name?: string
  avatar_url?: string
  type?: string
  person?: {
    email?: string
  }
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

// 태그 슬러그 → 이름 매핑 캐시
let tagSlugToNameCache: Map<string, string> | null = null

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
 * 노션 People 프로퍼티를 Author로 변환
 * @param people - 노션 People 속성 배열
 * @param allowEmail - 이메일 노출 허용 여부 (기본값: false)
 * @returns Author 객체 또는 null
 */
function extractAuthorProperty(people: NotionPerson[], allowEmail: boolean = false): Author | null {
  if (!people || !Array.isArray(people) || people.length === 0) return null

  const person = people[0]
  
  // person 타입이 'person'인 경우만 처리
  if (person.type !== 'person') {
    return null
  }
  
  // 환경 변수로 이메일 노출 제어 (우선순위가 높음)
  const shouldExposeEmail = process.env.EXPOSE_PERSON_EMAIL === 'true' || allowEmail
  
  return {
    id: person.id || '',
    name: person.name || 'Unknown Author',
    email: shouldExposeEmail ? person.person?.email : null, // 조건부 이메일 노출
    avatar: person.avatar_url,
  }
}

/**
 * 노션 페이지 속성 타입 (Notion API 응답)
 */
interface NotionPageProperties {
  title?: { title: Array<{ plain_text: string }> }
  slug?: { rich_text: Array<{ plain_text: string }> }
  excerpt?: { rich_text: Array<{ plain_text: string }> }
  coverImage?: { files: Array<{ type: 'external' | 'file'; external?: { url: string }; file?: { url: string } }> }
  status?: { select?: { name: string } }
  category?: { select?: { id: string; name: string; color: string } }
  tags?: { multi_select: Array<{ id: string; name: string; color: string }> }
  Author?: { people: Array<NotionPerson> }  // 대문자 A로 변경
  publishedAt?: { date?: { start: string } }
  readingTime?: { number?: number }
}

/**
 * 노션 페이지를 Post 객체로 변환
 */
function transformNotionPageToPost(page: NotionPage): Post {
  const properties = page.properties as NotionPageProperties

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
  const category = extractSelectProperty(properties.category?.select || null) || {
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

  // 작성자 추출 (대문자 A로 수정)
  // 이메일 노출은 환경 변수로 제어 (기본값: false)
  const author = extractAuthorProperty(properties.Author?.people || [], false)
  
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
    author: author || undefined,
    createdAt,
    updatedAt,
    publishedAt,
    readingTime,
  }
}

/**
 * 노션 데이터베이스에서 게시된 포스트 목록 가져오기 (필터링 및 페이지네이션 지원)
 */
export async function getPublishedPosts(
  limit: number = 10,
  startCursor?: string,
  searchQuery?: string,
  category?: string,
): Promise<NotionDatabaseResponse> {
  try {
    // Notion SDK 타입에 맞춘 컴파운드 필터 구성
    const filter: QueryDatabaseParameters['filter'] = {
      and: [
        {
          property: 'status',
          select: { equals: 'Published' },
        },
        ...(searchQuery
          ? [
              {
                or: [
                  { property: 'title', title: { contains: searchQuery } },
                  {
                    property: 'excerpt',
                    rich_text: { contains: searchQuery },
                  },
                ],
              },
            ]
          : []),
        ...(category && category !== 'all'
          ? [
              {
                property: 'category',
                select: { equals: category },
              },
            ]
          : []),
      ],
    }

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter,
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

/**
 * 태그 슬러그를 노션 태그 이름으로 변환
 * 캐시를 사용하여 반복적인 쿼리 방지
 */
async function getTagNameFromSlug(slug: string): Promise<string | null> {
  // 캐시가 없으면 초기화
  if (!tagSlugToNameCache) {
    const allTags = await getAllTags()
    tagSlugToNameCache = new Map()
    
    allTags.forEach(tag => {
      tagSlugToNameCache!.set(tag.slug, tag.name)
    })
  }
  
  return tagSlugToNameCache.get(slug) || null
}

/**
 * 태그별 포스트 가져오기 (페이지네이션 지원)
 * @param tagSlug - 태그 슬러그 (URL에서 사용)
 */
export async function getPostsByTag(
  tagSlug: string,
  limit: number = 10,
  startCursor?: string,
): Promise<NotionDatabaseResponse> {
  try {
    // 슬러그를 노션 태그 이름으로 변환
    const tagName = await getTagNameFromSlug(tagSlug)
    
    if (!tagName) {
      // 매핑을 찾을 수 없으면 빈 결과 반환
      console.warn(`Tag slug "${tagSlug}" not found in mapping`)
      return { posts: [], hasMore: false, nextCursor: undefined }
    }
    
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'tags',
            multi_select: {
              contains: tagName,
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
    console.error('Error fetching posts by tag:', error)
    return {
      posts: [],
      hasMore: false,
    }
  }
}

/**
 * 모든 태그 목록과 포스트 카운트 가져오기
 */
export async function getAllTags(): Promise<Array<Tag & { count: number }>> {
  try {
    // 태그별로 그룹화하고 카운트
    const tagMap = new Map<string, { tag: Tag; count: number }>()
    
    // 페이지네이션을 사용하여 모든 포스트 가져오기
    let hasMore = true
    let startCursor: string | undefined = undefined
    
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
          property: 'status',
          select: {
            equals: 'Published',
          },
        },
        page_size: 100, // 페이지당 100개
        start_cursor: startCursor,
      })
      
      // 현재 페이지의 결과 처리 (태그 정보만 추출)
      response.results.forEach((page) => {
        // page를 NotionPage로 타입 캐스팅
        const notionPage = page as NotionPage
        const properties = notionPage.properties as NotionPageProperties
        
        // tags 속성 직접 접근 (변환 없이)
        const tags = properties.tags?.multi_select
        
        if (tags && Array.isArray(tags)) {
          tags.forEach((notionTag) => {
            const tag: Tag = {
              id: notionTag.id || '',
              name: notionTag.name || '',
              slug: notionTag.name?.toLowerCase().replace(/\s+/g, '-') || '',
              color: notionTag.color || 'default',
            }
            
            const existing = tagMap.get(tag.id)
            if (existing) {
              existing.count++
            } else {
              tagMap.set(tag.id, { tag, count: 1 })
            }
          })
        }
      })
      
      // 다음 페이지 준비
      hasMore = response.has_more
      startCursor = response.next_cursor || undefined
    }

    // Map을 배열로 변환하고 카운트 기준으로 정렬
    return Array.from(tagMap.values())
      .map(({ tag, count }) => ({ ...tag, count }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('Error fetching all tags:', error)
    return []
  }
}
