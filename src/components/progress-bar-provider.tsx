'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { ProgressBar } from './progress-bar'

interface ProgressBarContextValue {
  startLoading: () => void
  stopLoading: () => void
}

const ProgressBarContext = createContext<ProgressBarContextValue>({
  startLoading: () => {},
  stopLoading: () => {},
})

export const useProgressBar = () => useContext(ProgressBarContext)

export function ProgressBarProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 페이지 전환 감지
  useEffect(() => {
    setIsLoading(false)
  }, [pathname, searchParams])

  // 브라우저 뒤로가기/앞으로가기 감지
  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    // popstate 이벤트 리스너 (브라우저 내비게이션)
    window.addEventListener('popstate', handleComplete)

    // 링크 클릭 이벤트 감지
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && !link.target && !link.download) {
        const url = new URL(link.href)
        const currentUrl = new URL(window.location.href)
        
        // 같은 도메인 내 페이지 이동인 경우만 로딩 표시
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          handleStart()
        }
      }
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      window.removeEventListener('popstate', handleComplete)
      document.removeEventListener('click', handleClick, true)
    }
  }, [])

  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return (
    <ProgressBarContext.Provider value={{ startLoading, stopLoading }}>
      <ProgressBar isLoading={isLoading} />
      {children}
    </ProgressBarContext.Provider>
  )
}