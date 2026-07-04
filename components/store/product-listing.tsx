'use client'

import { useMemo, useState } from 'react'
import { useQueryStates } from 'nuqs'
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { filterParsers } from '@/lib/store/filter-parsers'
import { CATEGORIES, SORT_OPTIONS } from '@/lib/constants/products'
import { useProducts } from '@/lib/hooks/use-products'
import { ProductCard } from './product-card'
import { FilterPanel } from './filter-panel'
import { SkeletonGrid, SkeletonSidebar } from './productcard-skeletons'
import { ErrorBanner, ProductErrorBoundary } from './product-error-boundary'

// ─── Inner ────────────────────────────────────────────────────────────────────

function ProductListingInner() {
    const { fetchState, reload } = useProducts()
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [state, set] = useQueryStates(filterParsers, { history: 'push', shallow: true })

    const isLoading = fetchState.status === 'idle' || fetchState.status === 'loading'
    const products = fetchState.status === 'success' ? fetchState.data : []

    const activeCount =
        [...state.conditions, ...state.brands, ...state.networks, ...state.os, ...state.colors].length +
        state.rams.length + state.storages.length +
        (state.minPrice || state.maxPrice ? 1 : 0)

    const filtered = useMemo(() => {
        const minOk = !state.minPrice || !state.maxPrice || Number(state.minPrice) <= Number(state.maxPrice)

        let list = products.filter(p => {
            const title = `${p.brand} ${p.model}`
            if (state.q && !title.toLowerCase().includes(state.q.toLowerCase())) return false
            if (state.category !== 'All' && p.category !== state.category) return false
            if (state.conditions.length && !state.conditions.includes(p.condition)) return false
            if (state.brands.length && !state.brands.includes(p.brand)) return false
            if (state.rams.length && (p.ram_gb === null || !state.rams.includes(p.ram_gb))) return false
            if (state.storages.length && (p.storage_gb === null || !state.storages.includes(p.storage_gb))) return false
            if (state.networks.length && (p.network_type === null || !state.networks.includes(p.network_type))) return false
            if (state.os.length && (p.os === null || !state.os.includes(p.os))) return false
            if (state.colors.length && (p.color === null || !state.colors.includes(p.color))) return false
            if (minOk && state.minPrice && p.price < Number(state.minPrice)) return false
            if (minOk && state.maxPrice && p.price > Number(state.maxPrice)) return false
            return true
        })

        if (state.sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price)
        if (state.sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price)
        // 'newest' is already the default order from Supabase (order by created_at desc)

        return list
    }, [products, state])

    function clearAll() {
        set({
            conditions: [], brands: [], rams: [], storages: [],
            networks: [], os: [], colors: [], minPrice: '', maxPrice: '',
            sort: 'newest', category: 'All', q: '',
        })
    }

    return (
        <div className="min-h-screen bg-surface bg-gray-50">

            {/* Top bar */}
            <div className="border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2.5">

                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search gadgets…"
                                value={state.q}
                                onChange={e => set({ q: e.target.value })}
                                disabled={isLoading}
                                className="pl-9 bg-gray-50 border-gray-300 rounded-xl h-11 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#2563EB] focus-visible:ring-1 focus-visible:border-[#2563EB] disabled:opacity-50"
                            />
                        </div>

                        {/* Mobile filter toggle */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            disabled={isLoading}
                            className={`lg:hidden relative h-11 w-11 shrink-0 flex items-center justify-center rounded-xl border transition-colors disabled:opacity-50
                                ${activeCount > 0
                                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {activeCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-white text-[#2563EB] border border-[#2563EB] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {activeCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Category chips */}
                    <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => set({ category: cat })}
                                disabled={isLoading}
                                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-50
                                    ${state.category === cat
                                        ? 'bg-accent text-white border-accent'
                                        : 'bg-surface text-gray-600 border-gray-300 hover:border-accent-hover hover:text-accent'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-4 py-5 flex gap-5 items-start">

                {/* Desktop sidebar */}
                <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-surface rounded-2xl border border-gray-200 sticky top-[105px] max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
                    {isLoading
                        ? <SkeletonSidebar />
                        : <FilterPanel state={state} set={set} disabled={fetchState.status === 'error'} />
                    }
                </aside>

                {/* Main content */}
                <div className="flex-1 min-w-0">

                    {/* Result count + sort */}
                    <div className="flex items-center justify-between mb-4 min-h-[24px]">
                        {isLoading && <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse" />}
                        {!isLoading && fetchState.status === 'success' && (
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold text-gray-800">{filtered.length}</span>{' '}
                                {filtered.length === 1 ? 'listing' : 'listings'}
                            </p>
                        )}
                        <div className="hidden lg:flex items-center gap-1.5 ml-auto">
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                            <select
                                value={state.sort}
                                onChange={e => set({ sort: e.target.value })}
                                disabled={isLoading}
                                className="text-xs text-gray-600 border-0 bg-transparent font-medium focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                                {SORT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {isLoading && <SkeletonGrid />}

                    {fetchState.status === 'error' && (
                        <ErrorBanner
                            message={fetchState.message}
                            retryable={fetchState.retryable}
                            onRetry={reload}
                        />
                    )}

                    {fetchState.status === 'success' && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Search className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-700 font-medium">No listings match your filters</p>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting or clearing your filters</p>
                            {(activeCount > 0 || state.q || state.category !== 'All') && (
                                <button
                                    onClick={clearAll}
                                    className="mt-4 text-sm text-[#2563EB] font-medium hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}

                    {fetchState.status === 'success' && filtered.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filtered.map(product => (
                                <ProductCard key={product.variant_id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile bottom sheet */}
            {showMobileFilters && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                        onClick={() => setShowMobileFilters(false)}
                    />
                    <div
                        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white rounded-t-2xl flex flex-col"
                        style={{ maxHeight: '85vh' }}
                    >
                        <FilterPanel
                            state={state}
                            set={set}
                            onClose={() => setShowMobileFilters(false)}
                            isMobile
                            disabled={fetchState.status === 'error'}
                        />
                    </div>
                </>
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ProductListing() {
    return (
        <ProductErrorBoundary>
            <ProductListingInner />
        </ProductErrorBoundary>
    )
}