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
      // 왼쪽 버튼이 아니거나 modifier 키가 눌린 경우 무시
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return
      }
      
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      // 타입 가드: HTMLAnchorElement인지 확인
      if (!(link instanceof HTMLAnchorElement)) {
        return
      }
      
      // 새 탭/창에서 열거나 다운로드인 경우 무시
      if (link.target || link.download) {
        return
      }
      
      // href가 없는 경우 무시
      if (!link.href) {
        return
      }
      
      try {
        const url = new URL(link.href)
        const currentUrl = new URL(window.location.href)
        
        // 같은 도메인 내 다른 경로로 이동인 경우만 로딩 표시
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          handleStart()
        }
      } catch {
        // URL 파싱 실패 시 무시
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