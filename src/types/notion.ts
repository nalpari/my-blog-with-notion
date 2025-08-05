// 노션 블로그 관련 타입 정의

// 포스트 타입 정의
export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  status: 'Draft' | 'Published' | 'Archived'
  category: Category
  tags: Tag[]
  createdAt: string
  updatedAt: string
  publishedAt: string
  readingTime: number
}

// 카테고리 타입 정의
export interface Category {
  id: string
  name: string
  slug: string
  color: string
}

// 태그 타입 정의
export interface Tag {
  id: string
  name: string
  slug: string
  color: string
}

// 노션 블록 타입 정의
export interface NotionBlock {
  id: string
  type: string
  content: Record<string, unknown>
  children?: NotionBlock[]
}

// 노션 데이터베이스 응답 타입
export interface NotionDatabaseResponse {
  posts: Post[]
  hasMore: boolean
  nextCursor?: string
}

// 노션 페이지 응답 타입
export interface NotionPageResponse {
  post: Post
  blocks: NotionBlock[]
  relatedPosts: Post[]
}

// 노션 데이터베이스 프로퍼티 타입
export interface NotionDatabaseSchema {
  title: {
    type: 'title'
    title: Array<RichText>
  }
  slug: {
    type: 'rich_text'
    rich_text: Array<RichText>
  }
  excerpt: {
    type: 'rich_text'
    rich_text: Array<RichText>
  }
  coverImage: {
    type: 'files'
    files: Array<File>
  }
  status: {
    type: 'select'
    select: {
      name: 'Draft' | 'Published' | 'Archived'
      color: string
    }
  }
  category: {
    type: 'select'
    select: {
      name: string
      color: string
    }
  }
  tags: {
    type: 'multi_select'
    multi_select: Array<{
      name: string
      color: string
    }>
  }
  publishedAt: {
    type: 'date'
    date: {
      start: string
      end?: string
    }
  }
  readingTime: {
    type: 'number'
    number: number
  }
}

// 노션 Rich Text 타입
export interface RichText {
  type: 'text'
  text: {
    content: string
    link?: {
      url: string
    }
  }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  plain_text: string
  href?: string
}

// 노션 파일 타입
export interface File {
  name: string
  type: 'external' | 'file'
  external?: {
    url: string
  }
  file?: {
    url: string
    expiry_time: string
  }
}
