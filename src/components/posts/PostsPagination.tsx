'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGINATION_CONFIG } from '@/config/constants'
import { MESSAGES } from '@/config/messages'

interface PostsPaginationProps {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  onPageChange: (page: number) => void
}

export function PostsPagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
}: PostsPaginationProps) {
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

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        {MESSAGES.PREVIOUS_PAGE}
      </Button>

      <div className="flex gap-1">
        {currentPage > 3 && totalPages > PAGINATION_CONFIG.MAX_VISIBLE_PAGES && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              className="w-8 h-8 p-0"
            >
              1
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
            onClick={() => onPageChange(page)}
            className="w-8 h-8 p-0"
          >
            {page}
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
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 p-0"
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="gap-1"
      >
        {MESSAGES.NEXT_PAGE}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}