'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Home, RefreshCw } from 'lucide-react'
import { logger } from '@/lib'
import { Button } from '@/components'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('[ErrorBoundary]', error)
    if (errorInfo.componentStack) {
      logger.info('Component stack', errorInfo.componentStack)
    }
  }

  handleRetry = (): void => {
    this.setState({ error: null })
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  render(): ReactNode {
    if (this.state.error && this.props.fallback) {
      return this.props.fallback
    }

    if (this.state.error) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[320px] px-6 text-center"
          role="alert"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-600 mb-6 max-w-md">
            {this.state.error.message}
          </p>
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={this.handleRetry}>
              <RefreshCw size={16} />
              Try again
            </Button>
            <Button variant="secondary" onClick={this.handleGoHome}>
              <Home size={16} />
              Go home
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
