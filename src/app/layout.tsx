import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { ProgressBarProvider } from '@/components/progress-bar-provider'
import { ToastProvider } from '@/components/ui/toast-provider'
import { AuthModalProvider } from '@/contexts/AuthModalContext'
import { GlobalAuthModal } from '@/components/auth/GlobalAuthModal'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Blog - 모던한 개발자 블로그',
    template: '%s | Blog',
  },
  description:
    'Linear.app에서 영감을 받은 모던하고 미니멀한 개발자 블로그. React, TypeScript, Next.js 등 최신 웹 개발 기술에 대한 인사이트를 공유합니다.',
  keywords: [
    '개발',
    '프로그래밍',
    'React',
    'TypeScript',
    'Next.js',
    '웹개발',
    '블로그',
  ],
  authors: [{ name: 'Developer' }],
  creator: 'Developer',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://blog.example.com',
    title: 'Blog - 모던한 개발자 블로그',
    description: 'Linear.app에서 영감을 받은 모던하고 미니멀한 개발자 블로그',
    siteName: 'Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - 모던한 개발자 블로그',
    description: 'Linear.app에서 영감을 받은 모던하고 미니멀한 개발자 블로그',
    creator: '@developer',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <AuthModalProvider>
              <ProgressBarProvider>
                <div className="relative flex min-h-screen flex-col">
                  <div className="flex-1">{children}</div>
                </div>
              </ProgressBarProvider>
              <GlobalAuthModal />
            </AuthModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
