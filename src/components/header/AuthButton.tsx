'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { UserMenu } from './UserMenu'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { User, LogIn } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function AuthButton() {
  const { user, isLoading } = useAuth()
  const { openAuthModal } = useAuthModal()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // SSR/Hydration 안전성을 위한 로딩 처리
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center">
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    )
  }

  if (user) {
    // 로그인 상태: 사용자 아바타와 드롭다운 메뉴
    return (
      <UserMenu user={user}>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all"
          aria-label="사용자 메뉴"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.name || user.email || '사용자'}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.user_metadata?.name?.[0]?.toUpperCase() ||
               user.email?.[0]?.toUpperCase() ||
               <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </UserMenu>
    )
  }

  // 로그아웃 상태: 로그인 버튼
  return (
    <Button
      onClick={() => openAuthModal()}
      size="sm"
      variant="default"
      className="gap-2"
      aria-label="로그인"
    >
      <LogIn className="h-4 w-4" />
      <span className="hidden sm:inline">로그인</span>
    </Button>
  )
}