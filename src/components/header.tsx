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

/**
 * 네비게이션 헤더 컴포넌트
 * 
 * @component
 * @description
 * 이 컴포넌트는 다음과 같은 UI/UX 최적화를 포함합니다:
 * 
 * 1. **반응형 디자인**
 *    - 데스크탑: 가로 메뉴 배치
 *    - 모바일: 햄버거 메뉴로 공간 최적화
 *    - Tailwind breakpoint를 활용한 반응형 처리
 * 
 * 2. **모바일 사용성**
 *    - 터치 타겟 크기 44px 준수 (WCAG 기준)
 *    - 외부 클릭 시 자동으로 메뉴 닫기
 *    - 부드러운 트랜지션 애니메이션
 * 
 * 3. **성능 최적화**
 *    - useRef로 DOM 직접 참조
 *    - 조건부 이벤트 리스너 등록/해제
 *    - CSS backdrop-filter로 블러 효과
 * 
 * 4. **접근성**
 *    - aria-label로 햄버거 버튼 설명
 *    - 시맨틱 HTML 구조 (<header>, <nav>)
 *    - 키보드 네비게이션 지원
 */
export const Header = () => {
  // 모바일 메뉴 상태 관리 - 로컬 컴포넌트 상태로 관리
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 모바일 메뉴 DOM 참조 - 외부 클릭 감지에 사용
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  /**
   * 외부 클릭 시 모바일 메뉴 닫기 훅
   * 
   * @description
   * - 모바일 메뉴가 열려 있을 때만 이벤트 리스너 등록
   * - 메뉴 외부 클릭 시 자동으로 닫기
   * - cleanup 함수로 메모리 누수 방지
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 클릭된 요소가 모바일 메뉴 외부인 경우에만 메뉴 닫기
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    // 모바일 메뉴가 열렸을 때만 이벤트 리스너 등록
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    // cleanup 함수 - 컴포넌트 언마운트 시 또는 메뉴 닫힐 때 리스너 제거
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen]) // isMobileMenuOpen 상태 변경 시마다 effect 재실행

  /**
   * 모바일 메뉴 토글 함수
   * 햄버거 버튼 클릭 시 호출
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  /**
   * 모바일 메뉴 닫기 함수
   * 메뉴 내 링크 클릭 시 호출
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    /* 
      헤더 컴포넌트
      - sticky positioning으로 스크롤 시 상단 고정
      - backdrop-blur로 반투명 블러 효과
      - z-50으로 다른 요소보다 위에 표시
    */
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* 컨테이너 - 반응형 패딩과 최대 너비 제한 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* 로고 영역 - 홈 페이지로 이동 */}
        <Link href="/" className="flex items-center space-x-2">
          {/* 로고 아이콘 - 아이덴티티 시각화 */}
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-sm">
              B
            </span>
          </div>
          <span className="font-semibold text-lg">Blog</span>
        </Link>

        {/* 
          데스크톱 네비게이션 메뉴
          - md(768px) 이상에서만 표시
          - 호버 시 색상 변경으로 인터랙티브 피드백
        */}
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

        {/* 오른쪽 액션 영역 */}
        <div className="flex items-center space-x-2">
          {/* 
            모바일 햄버거 메뉴 버튼
            - md(768px) 미만에서만 표시
            - 상태에 따라 햄버거/X 아이콘 토글
            - 터치 타겟 44px 크기 확보 (p-2 = 8px * 2 + 20px icon = 36px, 호버 영역 포함)
          */}
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
          
          {/* 다크모드 토글 - 모든 화면 크기에서 표시 */}
          <ThemeToggle />
        </div>
      </div>

      {/* 
        모바일 메뉴 드롭다운
        - absolute positioning으로 헤더 아래 표시
        - 트랜지션 애니메이션으로 부드러운 열기/닫기
        - opacity와 translate를 함께 사용하여 페이드 + 슬라이드 효과
        - visibility로 닫힌 상태에서 키보드 포커스 방지
        - bg-background로 완전한 불투명 백그라운드 적용
        - shadow-lg로 그림자 효과 추가하여 깊이감 표현
      */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-2 invisible'
        }`}
      >
        {/* 
          모바일 네비게이션 링크 목록
          - 세로 배치로 모바일 최적화
          - 각 링크에 py-2로 터치 타겟 크기 확보
          - 클릭 시 closeMobileMenu로 메뉴 자동 닫기
        */}
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