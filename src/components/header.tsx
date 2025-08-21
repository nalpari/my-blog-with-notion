"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 메뉴 닫기
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-sm">
              B
            </span>
          </div>
          <span className="font-semibold text-lg">Blog</span>
        </Link>

        {/* 데스크톱 네비게이션 메뉴 */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            홈
          </Link>
          <Link 
            href="/posts" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            포스트
          </Link>
          <Link 
            href="/tags" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            태그
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          {/* 모바일 햄버거 메뉴 버튼 */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          
          <ThemeToggle />
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur border-b border-border/40 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-2 invisible'
        }`}
      >
        <nav className="container mx-auto px-4 py-4 space-y-4">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            홈
          </Link>
          <Link
            href="/posts"
            onClick={closeMobileMenu}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            포스트
          </Link>
          <Link
            href="/tags"
            onClick={closeMobileMenu}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            태그
          </Link>
        </nav>
      </div>
    </header>
  )
}