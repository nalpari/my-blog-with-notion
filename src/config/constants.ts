/**
 * 포스트 관련 설정
 */
export const POSTS_CONFIG = {
  POSTS_PER_PAGE: 9,
  MAX_TAGS_DISPLAY: 3,
  DEFAULT_AUTHOR: 'Blog Author',
  DEFAULT_READING_TIME: 5,
  DEFAULT_WORD_COUNT: 566,
  EXCERPT_LENGTH: 200,
  IMAGE_SIZES: {
    CARD: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    HERO: '(max-width: 768px) 100vw, 50vw',
  },
} as const

/**
 * 페이지네이션 설정
 */
export const PAGINATION_CONFIG = {
  MAX_VISIBLE_PAGES: 5,
  INITIAL_PAGE: 1,
} as const

/**
 * API 설정
 */
export const API_CONFIG = {
  POSTS_ENDPOINT: '/api/posts',
  DEFAULT_LIMIT: 9,
  MAX_LIMIT: 100,
  CACHE_REVALIDATE: 60, // seconds
} as const

/**
 * 필터 설정
 */
export const FILTER_CONFIG = {
  ALL_CATEGORIES: 'all',
  DEFAULT_CATEGORY: undefined,
  DEFAULT_SEARCH: '',
} as const