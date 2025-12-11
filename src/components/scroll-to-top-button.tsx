'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Neo-Futurism Scroll-to-Top Button
 * Floating button with neon glow effects
 */
export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

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

  return (
    <button
      onClick={handleScrollToTop}
      onKeyDown={handleKeyDown}
      className={`
        fixed bottom-8 right-8 z-50
        h-12 w-12 rounded-xl
        glass-card
        flex items-center justify-center
        transition-all duration-500
        group
        ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
        }
      `}
      aria-label="페이지 상단으로 이동"
      tabIndex={isVisible ? 0 : -1}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-xl p-px bg-gradient-to-br from-[#00f5ff]/50 via-transparent to-[#a855f7]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="h-full w-full rounded-[11px] bg-[#0a0a0f]" />
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-[#00f5ff] blur-lg opacity-20" />
      </div>

      {/* Icon */}
      <ArrowUp className="relative h-5 w-5 text-muted-foreground group-hover:text-[#00f5ff] transition-colors duration-300" />
    </button>
  )
}

export default ScrollToTopButton
