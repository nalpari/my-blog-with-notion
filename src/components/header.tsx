import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"

export const Header = () => {
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

        {/* 네비게이션 메뉴 */}
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
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}