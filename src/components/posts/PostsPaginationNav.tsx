'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGINATION_CONFIG } from '@/config/constants'
import { MESSAGES } from '@/config/messages'

interface PostsPaginationNavProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export function PostsPaginationNav({
  currentPage,
  totalPages,
  basePath,
}: PostsPaginationNavProps) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = PAGINATION_CONFIG.MAX_VISIBLE_PAGES
    const half = Math.floor(maxVisible / 2)

    let start = Math.max(1, currentPage - half)
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return null
  }

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
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        className="gap-1"
        asChild={currentPage !== 1}
        aria-label="이전 페이지로 이동"
      >
        {currentPage !== 1 ? (
          <Link href={getPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            {MESSAGES.PREVIOUS_PAGE}
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            {MESSAGES.PREVIOUS_PAGE}
          </>
        )}
      </Button>

      <div className="flex gap-1">
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

        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            className="w-8 h-8 p-0"
            asChild={page !== currentPage}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page === currentPage ? (
              <span aria-label={`현재 페이지, ${page}페이지`}>{page}</span>
            ) : (
              <Link href={getPageUrl(page)} aria-label={`${page}페이지로 이동`}>{page}</Link>
            )}
          </Button>
        ))}

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

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        className="gap-1"
        asChild={currentPage !== totalPages}
        aria-label="다음 페이지로 이동"
      >
        {currentPage !== totalPages ? (
          <Link href={getPageUrl(currentPage + 1)}>
            {MESSAGES.NEXT_PAGE}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            {MESSAGES.NEXT_PAGE}
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </nav>
  )
}