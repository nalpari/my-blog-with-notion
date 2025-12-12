/**
 * @fileoverview Header 컴포넌트 - 블로그 상단 네비게이션 바
 * 
 * 주요 기능:
 * - 반응형 네비게이션 메뉴 (데스크탑/모바일)
 * - 모바일 햄버거 메뉴와 트랜지션 애니메이션
 * - 다크모드 토글 기능
 * - Sticky positioning으로 스크롤 시 고정
 * - 외부 클릭 감지로 모바일 메뉴 자동 닫기
 */

"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { AuthButton } from "./header/AuthButton"

/**
 * 네비게이션 헤더 컴포넌트
 */
export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-6 w-6 rounded bg-foreground text-background flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform duration-200">
            B
          </div>
          <span className="font-medium text-sm text-foreground/90 group-hover:text-foreground transition-colors">Blog</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            홈
          </Link>
          <Link 
            href="/posts" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            포스트
          </Link>
          <Link 
            href="/tags" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            태그
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <AuthButton />
          <div className="w-px h-4 bg-border/50 mx-1 hidden sm:block" />
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden absolute top-14 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-2 invisible'
        }`}
      >
        <nav className="container mx-auto px-6 py-4 space-y-2">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            홈
          </Link>
          <Link
            href="/posts"
            onClick={closeMobileMenu}
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            포스트
          </Link>
          <Link
            href="/tags"
            onClick={closeMobileMenu}
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            태그
          </Link>
        </nav>
      </div>
    </header>
  )
}