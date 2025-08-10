'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { MESSAGES } from '@/config/messages'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">문제가 발생했습니다</h2>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || MESSAGES.ERROR_GENERIC}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={this.handleReset} variant="default">
                다시 시도
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                홈으로 이동
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}