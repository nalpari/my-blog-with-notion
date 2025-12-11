import type { Metadata } from 'next'
import { Outfit, Orbitron, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { ProgressBarProvider } from '@/components/progress-bar-provider'
import { ToastProvider } from '@/components/ui/toast-provider'
import { AuthModalProvider } from '@/contexts/AuthModalContext'
import { GlobalAuthModal } from '@/components/auth/GlobalAuthModal'

// Primary body font - Modern geometric sans-serif
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

// Display font - Futuristic display typeface
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

// Monospace font - Technical code font
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'NEXUS // Neo-Futurism Developer Blog',
    template: '%s | NEXUS',
  },
  description:
    'A neo-futuristic developer blog exploring the frontiers of modern web development. React, TypeScript, Next.js and beyond.',
  keywords: [
    '개발',
    '프로그래밍',
    'React',
    'TypeScript',
    'Next.js',
    '웹개발',
    '블로그',
    'Neo-Futurism',
    'Cyberpunk',
  ],
  authors: [{ name: 'Developer' }],
  creator: 'Developer',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://blog.example.com',
    title: 'NEXUS // Neo-Futurism Developer Blog',
    description: 'A neo-futuristic developer blog exploring the frontiers of modern web development',
    siteName: 'NEXUS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXUS // Neo-Futurism Developer Blog',
    description: 'A neo-futuristic developer blog exploring the frontiers of modern web development',
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
      className={`${outfit.variable} ${orbitron.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Favicon and theme color for browser chrome */}
        <meta name="theme-color" content="#0a0a0f" />
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
                  {/* Ambient background glow effects */}
                  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    {/* Top-left cyan glow */}
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00f5ff] rounded-full opacity-[0.07] blur-[120px]" />
                    {/* Bottom-right purple glow */}
                    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#a855f7] rounded-full opacity-[0.07] blur-[120px]" />
                    {/* Center magenta glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff00f5] rounded-full opacity-[0.03] blur-[150px]" />
                  </div>
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
