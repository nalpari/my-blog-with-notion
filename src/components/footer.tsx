import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-foreground text-background flex items-center justify-center font-bold text-xs">
                B
              </div>
              <span className="font-semibold text-lg tracking-tight">Blog</span>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              모던한 웹 개발에 대한 인사이트를 공유하는 개발자 블로그입니다.
              Linear Design System의 철학을 담아 간결하고 명확한 콘텐츠를 전달합니다.
            </p>
          </div>

          <div className="flex justify-start md:justify-end gap-6">
            <Button variant="outline" size="sm" className="h-9 px-4 gap-2 text-muted-foreground hover:text-foreground border-border/50 bg-background/50" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </Button>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            © 2024 Blog. All rights reserved.
          </p>
          <p>
            Powered by Notion & Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
