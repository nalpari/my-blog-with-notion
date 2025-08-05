'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Moon, Sun, Bell } from 'lucide-react'
import { useState } from 'react'

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSubscribePopoverOpen, setIsSubscribePopoverOpen] = useState(false)
  const [isThemePopoverOpen, setIsThemePopoverOpen] = useState(false)

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="flex items-center space-x-4">
      <Popover
        open={isSubscribePopoverOpen}
        onOpenChange={setIsSubscribePopoverOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="알림 구독"
            className="h-9 w-9 p-0"
            onMouseEnter={() => setIsSubscribePopoverOpen(true)}
            onMouseLeave={() => setIsSubscribePopoverOpen(false)}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80"
          onMouseEnter={() => setIsSubscribePopoverOpen(true)}
          onMouseLeave={() => setIsSubscribePopoverOpen(false)}
        >
          <div className="space-y-2">
            <h4 className="font-medium leading-none">알림 구독</h4>
            <p className="text-sm text-muted-foreground">
              새로운 블로그 포스트가 올라올 때마다 알림을 받아보세요!
            </p>
          </div>
        </PopoverContent>
      </Popover>
      <Popover open={isThemePopoverOpen} onOpenChange={setIsThemePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleDarkMode}
            aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="h-9 w-9 p-0"
            onMouseEnter={() => setIsThemePopoverOpen(true)}
            onMouseLeave={() => setIsThemePopoverOpen(false)}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80"
          onMouseEnter={() => setIsThemePopoverOpen(true)}
          onMouseLeave={() => setIsThemePopoverOpen(false)}
        >
          <div className="space-y-2">
            <h4 className="font-medium leading-none">테마 변경</h4>
            <p className="text-sm text-muted-foreground">
              현재 모드: {isDarkMode ? '다크 모드' : '라이트 모드'}
            </p>
            <p className="text-sm text-muted-foreground">
              클릭하여 {isDarkMode ? '라이트' : '다크'} 모드로 변경하세요.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
