/**
 * 커스텀 애플리케이션 에러 클래스
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * 에러 타입 체크
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * 에러를 사용자 친화적인 메시지로 변환
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message
  }
  
  if (error instanceof Error) {
    // Notion API 에러 처리
    if (error.message.includes('NOTION_TOKEN')) {
      return '노션 연동 설정이 필요합니다. 환경 변수를 확인해주세요.'
    }
    if (error.message.includes('NOTION_DATABASE_ID')) {
      return '노션 데이터베이스 설정이 필요합니다. 환경 변수를 확인해주세요.'
    }
    if (error.message.includes('404')) {
      return '요청한 리소스를 찾을 수 없습니다.'
    }
    if (error.message.includes('500')) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
    if (error.message.includes('network')) {
      return '네트워크 연결을 확인해주세요.'
    }
    
    return error.message
  }
  
  return '알 수 없는 오류가 발생했습니다.'
}

/**
 * API 에러 응답 생성
 */
export function createErrorResponse(error: unknown, defaultStatusCode = 500) {
  const message = getErrorMessage(error)
  const statusCode = isAppError(error) ? (error.statusCode || defaultStatusCode) : defaultStatusCode
  
  return {
    error: {
      message,
      code: isAppError(error) ? error.code : 'UNKNOWN_ERROR',
      statusCode
    }
  }
}

/**
 * 에러 로깅
 */
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}]` : ''
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`${timestamp} ${contextStr}`, error)
  } else {
    // 프로덕션에서는 외부 에러 트래킹 서비스로 전송
    // 예: Sentry, LogRocket 등
    console.error(`${timestamp} ${contextStr}`, getErrorMessage(error))
  }
}