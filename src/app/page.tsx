import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HomeClient } from './home-client'

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 border-b border-border/40 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

          <div className="container relative mx-auto px-6">
            <div className="max-w-3xl">
              <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight text-foreground mb-6 animate-fade-in-up">
                Design. <br />
                Develop. <br />
                Deploy.
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl animate-fade-in-up animation-delay-200">
                Linear Design System에서 영감을 받은 모던한 개발자 블로그.
                <br className="hidden sm:block" />
                기술적 통찰과 경험을 공유합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-2">Latest Posts</h2>
                <p className="text-muted-foreground">개발과 기술에 대한 최신 이야</p>
              </div>
            </div>

            <HomeClient />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
