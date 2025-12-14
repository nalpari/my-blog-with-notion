import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HomeClient } from './home-client'
import Link from 'next/link'
import { ArrowRight, Code2, Lightbulb, Rocket } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl opacity-15" />
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                               linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        <div className="container mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              개발 인사이트 공유
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 animate-fade-up stagger-1">
              <span className="text-foreground">기술과 </span>
              <span className="gradient-text">아이디어</span>
              <span className="text-foreground">가</span>
              <br />
              <span className="text-foreground">만나는 공간</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-up stagger-2 leading-relaxed">
              개발 경험, 기술 트렌드, 그리고 문제 해결 과정을 공유합니다.
              함께 성장하는 개발 여정에 오신 것을 환영합니다.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 animate-fade-up stagger-3">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
              >
                포스트 둘러보기
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tags"
                className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors"
              >
                태그 탐색
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Code2,
                title: '실전 코드',
                description: '실제 프로젝트에서 얻은 경험과 코드를 공유합니다.',
              },
              {
                icon: Lightbulb,
                title: '인사이트',
                description: '개발하면서 발견한 팁과 노하우를 담았습니다.',
              },
              {
                icon: Rocket,
                title: '트렌드',
                description: '최신 기술 동향과 도구들을 소개합니다.',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">최신 포스트</h2>
              <p className="text-muted-foreground">
                최근에 작성된 글들을 확인해보세요
              </p>
            </div>
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors group"
            >
              모든 포스트 보기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <HomeClient />
        </div>
      </section>

      <Footer />
    </div>
  )
}
