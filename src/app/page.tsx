import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HomeClient } from './home-client'
import { HeroSection } from '@/components/home/hero-section'

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection />

        {/* Featured Posts */}
        <section className="py-20 md:py-28 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Latest Posts</h2>
                <p className="text-muted-foreground text-lg">
                  Deep dives into code, design, and everything in between.
                </p>
              </div>

              <Link href="/posts" className="text-primary font-medium hover:underline underline-offset-4 flex items-center gap-2 group">
                View all posts
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <HomeClient />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
