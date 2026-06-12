'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchProducts } from '@/lib/store/fetch-products'
import type { StorefrontProduct } from '@/lib/types'

type FetchState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: StorefrontProduct[] }
    | { status: 'error'; message: string; retryable: boolean }

export function useProducts() {
    const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' })

    const load = useCallback(async () => {
        setFetchState({ status: 'loading' })
        try {
            const data = await fetchProducts()
            setFetchState({ status: 'success', data })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Could not load listings.'
            const retryable = !(err instanceof TypeError && message.includes('Invalid'))
            setFetchState({ status: 'error', message, retryable })
        }
    }, [])

    useEffect(() => { load() }, [load])

    return { fetchState, reload: load }
}