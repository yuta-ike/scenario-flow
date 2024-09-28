import React from "react"

import type { ErrorInfo } from "react"

type ErrorBoundaryProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error)
    console.error(info.componentStack)
  }

  static getDerivedStateFromError(_error: unknown) {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }

    return this.props.children
  }
}
