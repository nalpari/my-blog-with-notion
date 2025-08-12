/**
 * UI 메시지
 */
export const MESSAGES = {
  // 로딩 상태
  LOADING: '불러오는 중...',
  SEARCHING: '검색 중...',
  
  // 빈 상태
  NO_POSTS: '아직 게시된 포스트가 없습니다.',
  NO_SEARCH_RESULTS: '검색 결과가 없습니다.',
  NO_CATEGORY_POSTS: '이 카테고리에 포스트가 없습니다.',
  
  // 에러 메시지
  ERROR_LOADING_POSTS: '포스트를 불러오는 중 오류가 발생했습니다.',
  ERROR_ENV_VARS: '환경 변수 설정을 확인해주세요.',
  ERROR_POST_NOT_FOUND: '포스트를 찾을 수 없습니다.',
  ERROR_GENERIC: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  
  // 액션 메시지
  READ_MORE: '읽기 →',
  VIEW_ALL_POSTS: '모든 포스트 보기',
  BACK_TO_LIST: '← 목록으로',
  BACK_TO_HOME: '← 홈으로',
  
  // 필터 관련
  ALL_CATEGORIES: '전체',
  SEARCH_PLACEHOLDER: '포스트 검색...',
  FILTER_BY_CATEGORY: '카테고리별 보기',
  
  // 페이지네이션
  PREVIOUS_PAGE: '이전',
  NEXT_PAGE: '다음',
  PAGE_INFO: (current: number, total: number) => `${current} / ${total} 페이지`,
  
  // 포스트 정보
  READING_TIME: '분 읽기',
  WORD_COUNT: '단어',
  READING_TIME_FUNC: (minutes: number) => `${minutes}분 읽기`,
  WORD_COUNT_FUNC: (count: number) => `${count} 단어`,
  PUBLISHED_AT: (date: string) => `${date}에 게시됨`,
  UPDATED_AT: (date: string) => `${date}에 수정됨`,
  
  // SEO
  DEFAULT_TITLE: 'Blog',
  DEFAULT_DESCRIPTION: 'Welcome to my blog',
  POST_NOT_FOUND_TITLE: 'Post Not Found',
} as const