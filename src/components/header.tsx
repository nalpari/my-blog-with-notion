/**
 * @fileoverview Neo-Futurism Header Component
 *
 * Features:
 * - Glassmorphism navigation bar with neon accents
 * - Animated holographic logo
 * - Responsive mobile menu with smooth transitions
 * - Sticky positioning with backdrop blur
 */

"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, X, Zap, Terminal, Hash, Home } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { AuthButton } from "./header/AuthButton"

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Track scroll for header background change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on outside click
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

  const navLinks = [
    { href: '/', label: '홈', icon: Home },
    { href: '/posts', label: '포스트', icon: Terminal },
    { href: '/tags', label: '태그', icon: Hash },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'glass-card border-b border-[rgba(0,245,255,0.1)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-[72px] items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          {/* Animated Logo Icon */}
          <div className="relative h-10 w-10 rounded-xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f5ff] via-[#a855f7] to-[#ff00f5] opacity-90" />
            {/* Inner glow */}
            <div className="absolute inset-[2px] rounded-[10px] bg-[#0a0a0f] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00f5ff] group-hover:text-[#ff00f5] transition-colors duration-300" />
            </div>
            {/* Hover glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00f5ff] to-[#a855f7] blur-lg opacity-50" />
            </div>
          </div>

          {/* Logo Text */}
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-orbitron)] font-bold text-lg tracking-wider holo-text">
              NEXUS
            </span>
            <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase hidden sm:block">
              Dev Blog
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative px-4 py-2 rounded-lg transition-all duration-300"
            >
              {/* Hover background */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#00f5ff]/0 via-[#00f5ff]/5 to-[#00f5ff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Border glow on hover */}
              <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-[#00f5ff]/30 transition-colors duration-300" />

              <span className="relative flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-[#00f5ff] transition-colors duration-300">
                <link.icon className="w-4 h-4" />
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <AuthButton />
          <ThemeToggle />

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden relative p-2 rounded-lg transition-all duration-300 group"
            aria-label="메뉴 열기"
          >
            {/* Button background */}
            <div className="absolute inset-0 rounded-lg bg-[#00f5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-[#00f5ff]/30 transition-colors" />

            {isMobileMenuOpen ? (
              <X className="relative h-5 w-5 text-[#00f5ff]" />
            ) : (
              <Menu className="relative h-5 w-5 text-muted-foreground group-hover:text-[#00f5ff] transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden absolute top-[72px] left-0 right-0 transition-all duration-500 ease-out ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-4 invisible pointer-events-none'
        }`}
      >
        <div className="glass-card border-b border-[rgba(0,245,255,0.1)] mx-4 rounded-xl overflow-hidden">
          <nav className="p-4 space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover background */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#00f5ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Icon container */}
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#00f5ff]/5 group-hover:bg-[#00f5ff]/10 transition-colors">
                  <link.icon className="w-4 h-4 text-[#00f5ff]" />
                </div>

                <span className="relative font-medium text-foreground group-hover:text-[#00f5ff] transition-colors">
                  {link.label}
                </span>

                {/* Arrow indicator */}
                <svg
                  className="ml-auto w-4 h-4 text-muted-foreground group-hover:text-[#00f5ff] group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </nav>

          {/* Mobile menu footer */}
          <div className="px-4 py-3 border-t border-[rgba(0,245,255,0.1)]">
            <p className="text-xs text-muted-foreground text-center font-[family-name:var(--font-mono)]">
              <span className="text-[#00f5ff]">&gt;</span> NEXUS v1.0 <span className="text-[#a855f7]">{'//'}</span> Neo-Futurism
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
