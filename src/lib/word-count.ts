/**
 * 텍스트의 단어 수를 계산하는 유틸리티 함수
 * 한국어와 영어 텍스트를 모두 고려합니다
 */
export function calculateWordCount(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0
  }

  // HTML 태그 제거
  const cleanText = text.replace(/<[^>]*>/g, '')
  
  // 마크다운 문법 제거 (간단한 패턴들)
  const withoutMarkdown = cleanText
    .replace(/#{1,6}\s+/g, '') // 헤딩
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 볼드
    .replace(/\*([^*]+)\*/g, '$1') // 이탤릭
    .replace(/`([^`]+)`/g, '$1') // 인라인 코드
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크
    .replace(/^\s*[-*+]\s+/gm, '') // 리스트
    .replace(/^\s*\d+\.\s+/gm, '') // 번호 리스트
    .replace(/^\s*>\s+/gm, '') // 인용문

  // 한국어 문자 수 계산 (한글, 한자 등)
  const koreanChars = (withoutMarkdown.match(/[\u3131-\u318E\uAC00-\uD7A3\u4E00-\u9FFF]/g) || []).length
  
  // 영어 단어 수 계산
  const englishWords = withoutMarkdown
    .replace(/[\u3131-\u318E\uAC00-\uD7A3\u4E00-\u9FFF]/g, ' ') // 한국어 문자를 공백으로 치환
    .split(/\s+/)
    .filter(word => word.trim().length > 0 && /[a-zA-Z]/.test(word)).length

  // 한국어는 문자 단위로, 영어는 단어 단위로 계산
  // 한국어 2글자를 영어 1단어로 환산
  return Math.ceil(koreanChars / 2) + englishWords
}

/**
 * 읽기 시간을 계산하는 함수
 * @param wordCount 단어 수
 * @param wordsPerMinute 분당 읽기 단어 수 (기본값: 200)
 */
export function calculateReadingTime(wordCount: number, wordsPerMinute: number = 200): number {
  if (wordCount <= 0) {
    return 1
  }
  
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

/**
 * 텍스트에서 읽기 시간을 직접 계산하는 함수
 */
export function calculateReadingTimeFromText(text: string, wordsPerMinute: number = 200): number {
  const wordCount = calculateWordCount(text)
  return calculateReadingTime(wordCount, wordsPerMinute)
}