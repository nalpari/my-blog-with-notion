'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 스크롤 투 탑 플로팅 버튼 컴포넌트
 * 스크롤이 일정 높이 이상 내려갔을 때 나타나며, 클릭 시 페이지 상단으로 부드럽게 이동
 */
export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // 스크롤이 300px 이상 내려갔을 때 버튼 표시
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', toggleVisibility)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleScrollToTop()
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <Button
      onClick={handleScrollToTop}
      onKeyDown={handleKeyDown}
      className={
        'fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full bg-zinc-800 text-white shadow-lg transition-all duration-300 hover:bg-zinc-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-700 dark:hover:bg-zinc-600'
      }
      size="icon"
      aria-label="페이지 상단으로 이동"
      tabIndex={0}
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  )
}

export default ScrollToTopButton