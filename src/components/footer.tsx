/**
 * @fileoverview Footer 컴포넌트 - 모던하고 미니멀한 푸터
 */

import Link from 'next/link'
import { Sparkles, Github, Mail, Rss } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Mail, href: 'mailto:hello@example.com', label: 'Email' },
    { icon: Rss, href: '/rss.xml', label: 'RSS' },
  ]

  const footerLinks = [
    { href: '/posts', label: '포스트' },
    { href: '/tags', label: '태그' },
  ]

  return (
    <footer className="relative mt-auto border-t border-border/50 bg-background">
      {/* 상단 그라디언트 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* 메인 푸터 콘텐츠 */}
        <div className="py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
            {/* 브랜드 섹션 */}
            <div className="max-w-sm">
              <Link href="/" className="group inline-flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/70">
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="text-xl font-semibold tracking-tight">DevLog</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                개발과 기술에 대한 인사이트를 공유하는 블로그입니다.
                새로운 기술 트렌드와 개발 경험을 함께 나눠요.
              </p>
            </div>

            {/* 링크 섹션 */}
            <div className="flex gap-16">
              {/* 네비게이션 링크 */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4">탐색</h4>
                <ul className="space-y-3">
                  {footerLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 소셜 링크 */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4">연결</h4>
                <ul className="space-y-3">
                  {socialLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="border-t border-border/50 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} DevLog. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with{' '}
              <span className="inline-flex items-center gap-1">
                <span className="text-accent">Next.js</span>
                &
                <span className="text-accent">Notion</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
