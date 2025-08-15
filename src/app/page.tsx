import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HomeClient } from './home-client'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Featured Posts */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl mb-4">최신 글</h2>
            <p className="text-muted-foreground text-base sm:text-lg">
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
