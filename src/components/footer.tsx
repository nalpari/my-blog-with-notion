/**
 * @fileoverview Neo-Futurism Footer Component
 *
 * Features:
 * - Cyberpunk aesthetic with neon accents
 * - Animated grid background
 * - Social links with hover effects
 * - Terminal-style copyright text
 */

import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail, Zap, ExternalLink } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:hello@example.com', label: 'Email' },
  ]

  const quickLinks = [
    { label: '홈', href: '/' },
    { label: '포스트', href: '/posts' },
    { label: '태그', href: '/tags' },
  ]

  return (
    <footer className="relative pt-20 pb-8 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent opacity-50" />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00f5ff] rounded-full blur-[150px] opacity-[0.03]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            {/* Logo */}
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00f5ff] via-[#a855f7] to-[#ff00f5] opacity-90" />
                <div className="absolute inset-[2px] rounded-[10px] bg-[#0a0a0f] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#00f5ff]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-[family-name:var(--font-orbitron)] font-bold text-xl tracking-wider holo-text">
                  NEXUS
                </span>
                <span className="text-xs text-muted-foreground tracking-[0.15em] uppercase">
                  Developer Blog
                </span>
              </div>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              미래를 향한 개발 여정. 최신 웹 기술과 프로그래밍 인사이트를 공유하는 네오-퓨처리즘 개발자 블로그.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 rounded-lg transition-all duration-300"
                  aria-label={social.label}
                >
                  {/* Background */}
                  <div className="absolute inset-0 rounded-lg bg-[#00f5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Border */}
                  <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-[#00f5ff]/30 transition-colors" />
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-[#00f5ff] blur-lg opacity-20" />
                  </div>
                  <social.icon className="relative w-4 h-4 text-muted-foreground group-hover:text-[#00f5ff] transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold tracking-wider text-[#00f5ff] uppercase">
              Navigation
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="text-[#00f5ff] opacity-50 group-hover:opacity-100 transition-opacity">
                      &gt;
                    </span>
                    <span className="text-sm">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack / Status */}
          <div className="space-y-6">
            <h3 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold tracking-wider text-[#a855f7] uppercase">
              System Status
            </h3>
            <div className="space-y-3 font-[family-name:var(--font-mono)] text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                <span>All systems operational</span>
              </div>
              <div className="text-muted-foreground">
                <span className="text-[#00f5ff]">Framework:</span> Next.js 15
              </div>
              <div className="text-muted-foreground">
                <span className="text-[#a855f7]">Runtime:</span> React 19
              </div>
              <div className="text-muted-foreground">
                <span className="text-[#ff00f5]">Language:</span> TypeScript
              </div>
              <div className="text-muted-foreground">
                <span className="text-[#ff8800]">CMS:</span> Notion API
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative h-px mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00f5ff]" />
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright - Terminal Style */}
          <div className="font-[family-name:var(--font-mono)] text-xs text-muted-foreground">
            <span className="text-[#00f5ff]">$</span>
            <span className="mx-2">copyright</span>
            <span className="text-[#a855f7]">--year</span>
            <span className="mx-1">{currentYear}</span>
            <span className="text-muted-foreground/50">|</span>
            <span className="mx-2">NEXUS</span>
            <span className="text-muted-foreground/50">|</span>
            <span className="mx-2 text-[#ff00f5]">Neo-Futurism</span>
          </div>

          {/* Built with */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Crafted with</span>
            <span className="text-[#ff4757]">♥</span>
            <span>using</span>
            <a
              href="https://claude.ai/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#00f5ff] hover:text-[#a855f7] transition-colors"
            >
              Claude Code
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Decorative bottom line */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#00f5ff]/50" />
          <div className="h-1 w-1 rounded-full bg-[#00f5ff]" />
          <div className="h-px w-16 bg-gradient-to-r from-[#00f5ff]/50 via-[#a855f7]/50 to-[#ff00f5]/50" />
          <div className="h-1 w-1 rounded-full bg-[#a855f7]" />
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#ff00f5]/50" />
        </div>
      </div>
    </footer>
  )
}

export { Footer }
