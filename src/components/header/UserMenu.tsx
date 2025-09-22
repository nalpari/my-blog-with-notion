'use client'

import { ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast-provider'
import { LogOut, Settings, User as UserIcon, Mail } from 'lucide-react'

interface UserMenuProps {
  user: User
  children: ReactNode
}

export function UserMenu({ user, children }: UserMenuProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      showToast('로그아웃되었습니다', 'success')
      router.refresh()
    } catch (error) {
      console.error('로그아웃 중 오류:', error)
      showToast('로그아웃에 실패했습니다', 'error')
    }
  }

  const userName = user.user_metadata?.name || user.user_metadata?.full_name
  const userEmail = user.email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {userName && (
              <p className="text-sm font-medium leading-none">{userName}</p>
            )}
            {userEmail && (
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault()
            // 프로필 페이지로 이동 (추후 구현)
            showToast('프로필 페이지는 준비 중입니다', 'info')
          }}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>프로필</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault()
            // 설정 페이지로 이동 (추후 구현)
            showToast('설정 페이지는 준비 중입니다', 'info')
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>설정</span>
        </DropdownMenuItem>
        {user.app_metadata?.provider === 'email' && (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => {
              e.preventDefault()
              // 이메일 설정 (추후 구현)
              showToast('이메일 설정은 준비 중입니다', 'info')
            }}
          >
            <Mail className="mr-2 h-4 w-4" />
            <span>이메일 설정</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}