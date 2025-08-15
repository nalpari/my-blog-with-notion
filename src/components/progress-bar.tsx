'use client'

import { useEffect, useState } from 'react'

interface ProgressBarProps {
  isLoading: boolean
}

export function ProgressBar({ isLoading }: ProgressBarProps) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setVisible(true)
      setProgress(0)
      
      // 점진적으로 진행률 증가
      const timer1 = setTimeout(() => setProgress(30), 100)
      const timer2 = setTimeout(() => setProgress(60), 300)
      const timer3 = setTimeout(() => setProgress(85), 500)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      // 로딩 완료 시
      setProgress(100)
      const hideTimer = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 300)
      
      return () => clearTimeout(hideTimer)
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent pointer-events-none">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        style={{ 
          width: `${progress}%`,
          transition: progress === 100 ? 'width 0.3s ease-out' : 'width 0.5s ease-out'
        }}
      />
    </div>
  )
}