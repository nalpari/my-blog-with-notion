import { Button } from "@/components/ui/button"

const Footer = () => {
  return (
    <footer className="pt-[62px] pb-12 sm:pt-[66px] sm:pb-16 lg:pt-[70px] lg:pb-20 border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">
                B
              </span>
            </div>
            <span className="font-semibold text-lg">Blog</span>
          </div>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            모던한 웹 개발과 디자인에 대한 인사이트를 공유하는 개발자
            블로그입니다.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="ghost" size="sm">
              GitHub
            </Button>
            <Button variant="ghost" size="sm">
              Twitter
            </Button>
            <Button variant="ghost" size="sm">
              LinkedIn
            </Button>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Blog. Linear Design System을 기반으로 제작되었습니다.</p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }