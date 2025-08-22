/**
 * @fileoverview PostsPaginationNav 컴포넌트 - 페이지네이션 네비게이션 바
 * 
 * 주요 기능:
 * - 직관적인 페이지 네비게이션 UI
 * - 이전/다음 페이지 버튼
 * - 페이지 번호 직접 선택
 * - 열림표(...) 처리로 긴 페이지 목록 처리
 * - WCAG 접근성 준수
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGINATION_CONFIG } from '@/config/constants'
import { MESSAGES } from '@/config/messages'

/**
 * PostsPaginationNav 컴포넌트의 Props 인터페이스
 * 
 * @interface PostsPaginationNavProps
 * @property {number} currentPage - 현재 페이지 번호
 * @property {number} totalPages - 전체 페이지 수
 * @property {string} basePath - 기본 URL 경로 (query 파라미터 포함 가능)
 */
interface PostsPaginationNavProps {
  currentPage: number
  totalPages: number
  basePath: string
}

/**
 * 페이지네이션 네비게이션 컴포넌트
 * 
 * @component
 * @example
 * ```tsx
 * <PostsPaginationNav
 *   currentPage={2}
 *   totalPages={10}
 *   basePath="/posts"
 * />
 * ```
 * 
 * @description
 * 이 컴포넌트는 다음과 같은 UI/UX 최적화를 포함합니다:
 * 
 * 1. **직관적인 네비게이션**
 *    - 현재 페이지 강조 표시
 *    - 이전/다음 버튼으로 순차 이동
 *    - 직접 페이지 번호 클릭으로 빠른 이동
 * 
 * 2. **스마트 페이지 번호 표시**
 *    - 현재 페이지 주변 N개만 표시
 *    - 양 끝에 첫/마지막 페이지 바로가기
 *    - 생략 부분은 '...' 로 표시
 * 
 * 3. **URL 관리**
 *    - 쿼리 파라미터 보존
 *    - 첫 페이지는 page 파라미터 생략
 *    - Next.js 링크 객체 형식 사용
 * 
 * 4. **접근성**
 *    - aria-label로 버튼 설명
 *    - aria-current로 현재 페이지 표시
 *    - 키보드 네비게이션 지원
 *    - 비활성 버튼 상태 명확히 표시
 */
export function PostsPaginationNav({
  currentPage,
  totalPages,
  basePath,
}: PostsPaginationNavProps) {
  /**
   * 표시할 페이지 번호 배열 생성
   * 
   * @description
   * 현재 페이지를 중심으로 최대 MAX_VISIBLE_PAGES개의 페이지 번호를 표시
   * 예: 현재 5페이지, 최대 5개 표시 → [3, 4, 5, 6, 7]
   */
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = PAGINATION_CONFIG.MAX_VISIBLE_PAGES
    const half = Math.floor(maxVisible / 2)

    // 시작 페이지 계산 (현재 페이지 중심)
    let start = Math.max(1, currentPage - half)
    const end = Math.min(totalPages, start + maxVisible - 1)

    // 끝에 도달했을 때 시작 위치 재조정
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    // 페이지 번호 배열 생성
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  // 페이지가 1개 이하면 페이지네이션 필요 없음
  if (totalPages <= 1) {
    return null
  }

  /**
   * 페이지 URL 생성 함수
   * 
   * @param {number} page - 대상 페이지 번호
   * @returns {object} Next.js Link href 객체
   * 
   * @description
   * - 기존 쿼리 파라미터 보존
   * - 첫 페이지(1)는 page 파라미터 생략하여 URL 깨끗하게 유지
   * - Next.js 링크 객체 형식으로 반환하여 클라이언트 사이드 네비게이션 최적화
   */
  const getPageUrl = (page: number) => {
    // basePath를 pathname과 query로 분리
    const [pathname, queryString] = basePath.split('?')
    const existingParams = new URLSearchParams(queryString || '')
    
    // 기존 쿼리 파라미터를 객체로 변환
    const query: Record<string, string> = {}
    existingParams.forEach((value, key) => {
      if (key !== 'page') { // page 파라미터는 제외
        query[key] = value
      }
    })
    
    // page가 1이 아닌 경우에만 page 파라미터 추가
    if (page > 1) {
      query.page = page.toString()
    }
    
    // Next.js Link href 객체 형식 반환
    return {
      pathname,
      query
    }
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-8">
      {/* 이전 페이지 버튼 */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        className="gap-1"
        asChild={currentPage !== 1}  // 활성 상태일 때만 Link로 변환
        aria-label="이전 페이지로 이동"
      >
        {currentPage !== 1 ? (
          // 활성 상태: 링크로 렌더링
          <Link href={getPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            {MESSAGES.PREVIOUS_PAGE}
          </Link>
        ) : (
          // 비활성 상태: 일반 버튼으로 렌더링
          <>
            <ChevronLeft className="h-4 w-4" />
            {MESSAGES.PREVIOUS_PAGE}
          </>
        )}
      </Button>

      {/* 페이지 번호 버튼 그룹 */}
      <div className="flex gap-1">
        {/* 
          첫 페이지와 생략 부분
          - 현재 페이지가 3보다 크고 전체 페이지가 많을 때만 표시
        */}
        {currentPage > 3 && totalPages > PAGINATION_CONFIG.MAX_VISIBLE_PAGES && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              asChild
            >
              <Link href={getPageUrl(1)} aria-label="1페이지로 이동">1</Link>
            </Button>
            {currentPage > 4 && (
              <span className="px-2 flex items-center text-muted-foreground">
                ...
              </span>
            )}
          </>
        )}

        {/* 메인 페이지 번호 버튼들 */}
        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}  // 현재 페이지 강조
            size="sm"
            className="w-8 h-8 p-0"
            asChild={page !== currentPage}  // 다른 페이지는 Link로 변환
            aria-current={page === currentPage ? 'page' : undefined}  // 현재 페이지 표시
          >
            {page === currentPage ? (
              // 현재 페이지: 클릭 불가
              <span aria-label={`현재 페이지, ${page}페이지`}>{page}</span>
            ) : (
              // 다른 페이지: 클릭 가능
              <Link href={getPageUrl(page)} aria-label={`${page}페이지로 이동`}>{page}</Link>
            )}
          </Button>
        ))}

        {/* 
          마지막 페이지와 생략 부분
          - 현재 페이지가 끝에서 3번째 이상 떨어져 있고 전체 페이지가 많을 때만 표시
        */}
        {currentPage < totalPages - 2 && totalPages > PAGINATION_CONFIG.MAX_VISIBLE_PAGES && (
          <>
            {currentPage < totalPages - 3 && (
              <span className="px-2 flex items-center text-muted-foreground">
                ...
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              asChild
            >
              <Link href={getPageUrl(totalPages)} aria-label={`마지막 페이지(${totalPages}페이지)로 이동`}>{totalPages}</Link>
            </Button>
          </>
        )}
      </div>

      {/* 다음 페이지 버튼 */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        className="gap-1"
        asChild={currentPage !== totalPages}  // 활성 상태일 때만 Link로 변환
        aria-label="다음 페이지로 이동"
      >
        {currentPage !== totalPages ? (
          // 활성 상태: 링크로 렌더링
          <Link href={getPageUrl(currentPage + 1)}>
            {MESSAGES.NEXT_PAGE}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          // 비활성 상태: 일반 버튼으로 렌더링
          <>
            {MESSAGES.NEXT_PAGE}
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </nav>
  )
}