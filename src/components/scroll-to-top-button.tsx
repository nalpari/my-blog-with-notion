'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 스크롤 투 탑 플로팅 버튼 컴포넌트
 * 스크롤이 300px 이상 내려갔을 때 나타나며, 클릭 시 페이지 상단으로 부드럽게 이동
 */
export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  /**
   * 스크롤 위치를 감지하여 버튼 표시 여부를 결정
   */
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    setIsVisible(scrollTop > 300)
  }

  /**
   * 페이지 상단으로 부드럽게 스크롤
   */
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  /**
   * 키보드 접근성을 위한 Enter 키 핸들러
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleScrollToTop()
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <Button
      onClick={handleScrollToTop}
      onKeyDown={handleKeyDown}
      className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      size="sm"
      aria-label="페이지 상단으로 이동"
      tabIndex={0}
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  )
}