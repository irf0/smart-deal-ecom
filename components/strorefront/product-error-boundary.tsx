'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Error Boundary ───────────────────────────────────────────────────────────

type EBState = { hasError: boolean; error: Error | null }

export class ProductErrorBoundary extends Component<
    { children: ReactNode; fallback?: ReactNode },
    EBState
> {
    constructor(props: { children: ReactNode; fallback?: ReactNode }) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): EBState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ProductListing] Uncaught error:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-gray-800 font-semibold">Something went wrong</p>
                    <p className="text-gray-400 text-sm mt-1 max-w-xs">
                        {this.state.error?.message ?? 'An unexpected error occurred.'}
                    </p>
                    <Button
                        className="mt-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Try again
                    </Button>
                </div>
            )
        }
        return this.props.children
    }
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

export function ErrorBanner({
    message,
    retryable,
    onRetry,
}: {
    message: string
    retryable: boolean
    onRetry: () => void
}) {
    const isOffline =
        message.toLowerCase().includes('network') ||
        message.toLowerCase().includes('fetch') ||
        !navigator.onLine

    return (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isOffline ? 'bg-yellow-50' : 'bg-red-50'}`}>
                {isOffline
                    ? <WifiOff className="w-6 h-6 text-yellow-500" />
                    : <AlertCircle className="w-6 h-6 text-red-400" />
                }
            </div>
            <p className="text-gray-800 font-semibold">
                {isOffline ? "You're offline" : 'Failed to load listings'}
            </p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
                {isOffline ? 'Check your internet connection and try again.' : message}
            </p>
            {retryable && (
                <Button
                    onClick={onRetry}
                    className="mt-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl gap-2"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                </Button>
            )}
        </div>
    )
}