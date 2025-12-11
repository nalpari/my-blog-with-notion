import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HomeClient } from './home-client'
import { Sparkles, ArrowDown, Code2, Cpu, Layers } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 cyber-grid opacity-40" />

        {/* Hero gradient overlay */}
        <div className="absolute inset-0 hero-gradient" />

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-[#00f5ff]/10 blur-3xl float animation-delay-200" />
        <div className="absolute bottom-32 right-[15%] w-40 h-40 rounded-full bg-[#a855f7]/10 blur-3xl float animation-delay-500" />
        <div className="absolute top-1/2 right-[5%] w-24 h-24 rounded-full bg-[#ff00f5]/10 blur-3xl float animation-delay-700" />

        {/* Decorative lines */}
        <div className="absolute left-0 top-1/2 w-32 h-px bg-gradient-to-r from-transparent to-[#00f5ff]/30" />
        <div className="absolute right-0 top-1/3 w-48 h-px bg-gradient-to-l from-transparent to-[#a855f7]/30" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-[#00f5ff]" />
              <span className="text-sm font-medium text-muted-foreground">
                Neo-Futurism Developer Blog
              </span>
            </div>

            {/* Main heading */}
            <h1 className="mb-6 animate-fade-in-up animation-delay-100">
              미래를 코딩하다
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              최신 웹 기술과 프로그래밍 인사이트를 탐험하는 여정.
              <br className="hidden sm:block" />
              <span className="text-[#00f5ff]">React</span>,{' '}
              <span className="text-[#a855f7]">TypeScript</span>,{' '}
              <span className="text-[#ff00f5]">Next.js</span> 그리고 그 너머로.
            </p>

            {/* Stats or tech badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card">
                <Code2 className="w-4 h-4 text-[#00f5ff]" />
                <span className="text-sm font-medium">Clean Code</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card">
                <Cpu className="w-4 h-4 text-[#a855f7]" />
                <span className="text-sm font-medium">Modern Stack</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card">
                <Layers className="w-4 h-4 text-[#ff00f5]" />
                <span className="text-sm font-medium">Best Practices</span>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="animate-fade-in-up animation-delay-400">
              <a
                href="#posts"
                className="inline-flex flex-col items-center gap-2 text-muted-foreground hover:text-[#00f5ff] transition-colors group"
              >
                <span className="text-xs uppercase tracking-widest">Explore</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Posts Section */}
      <section id="posts" className="py-16 sm:py-24 relative">
        {/* Section background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-[#00f5ff]/30 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-12 sm:mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00f5ff]/20 bg-[#00f5ff]/5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff] animate-pulse" />
              <span className="text-xs font-[family-name:var(--font-mono)] text-[#00f5ff] uppercase tracking-wider">
                Latest Posts
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-orbitron)] font-bold mb-4">
              <span className="holo-text">최신 글</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              개발과 기술에 대한 최신 인사이트를 확인해보세요
            </p>
          </div>

          <HomeClient />
        </div>
      </section>

      <Footer />
    </div>
  )
}
