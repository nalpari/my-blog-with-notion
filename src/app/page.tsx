import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-lg">Blog</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              홈
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              글
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              소개
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              연락
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              다크모드
            </Button>
            <Button size="sm">
              구독하기
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-24">
        <div className="container text-center mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              모던하고 미니멀한
              <br />
              <span className="text-accent">개발자 블로그</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Linear.app에서 영감을 받은 깔끔하고 세련된 디자인으로 
              개발 경험과 인사이트를 공유합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8">
                최신 글 보기
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8">
                구독하기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl mb-4">최신 글</h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              개발과 기술에 대한 최신 인사이트를 확인해보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Post 1 */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span>2024.01.15</span>
                  <span>•</span>
                  <span className="bg-accent/10 text-accent px-2 py-1 rounded-md text-xs font-medium">
                    React
                  </span>
                </div>
                <CardTitle className="group-hover:text-accent transition-colors">
                  Next.js 15와 React 19의 새로운 기능들
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  최신 Next.js와 React의 혁신적인 기능들을 살펴보고, 
                  실제 프로젝트에 어떻게 적용할 수 있는지 알아봅니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">5분 읽기</span>
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
                    읽기 →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured Post 2 */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span>2024.01.12</span>
                  <span>•</span>
                  <span className="bg-accent-green/10 text-accent-green px-2 py-1 rounded-md text-xs font-medium">
                    TypeScript
                  </span>
                </div>
                <CardTitle className="group-hover:text-accent transition-colors">
                  TypeScript 5.0 고급 타입 시스템 활용법
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  TypeScript의 고급 타입 기능들을 활용해서 
                  더 안전하고 표현력 있는 코드를 작성하는 방법을 소개합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">8분 읽기</span>
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
                    읽기 →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured Post 3 */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span>2024.01.10</span>
                  <span>•</span>
                  <span className="bg-accent-orange/10 text-accent-orange px-2 py-1 rounded-md text-xs font-medium">
                    Design
                  </span>
                </div>
                <CardTitle className="group-hover:text-accent transition-colors">
                  Linear.app에서 배우는 UI/UX 디자인 원칙
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  Linear의 미니멀하고 효율적인 디자인 철학을 분석하고, 
                  우리 프로젝트에 적용할 수 있는 인사이트를 정리했습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">6분 읽기</span>
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
                    읽기 →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container max-w-3xl text-center mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl mb-4">뉴스레터 구독</h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8">
            새로운 글과 개발 인사이트를 이메일로 받아보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="이메일 주소를 입력하세요" 
              className="flex-1"
            />
            <Button className="sm:w-auto">
              구독하기
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            언제든지 구독을 취소할 수 있습니다. 스팸은 보내지 않습니다.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-sm">B</span>
                </div>
                <span className="font-semibold text-lg">Blog</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                모던한 웹 개발과 디자인에 대한 인사이트를 공유하는 개발자 블로그입니다.
              </p>
              <div className="flex space-x-4">
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
            
            <div>
              <h3 className="font-semibold mb-4">카테고리</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">React</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">TypeScript</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Next.js</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Design</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">링크</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">소개</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">연락</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">RSS</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">사이트맵</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Blog. Linear Design System을 기반으로 제작되었습니다.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
