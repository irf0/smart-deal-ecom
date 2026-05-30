'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
    page: number
    totalPages: number
    filters: Record<string, string | undefined>
}

export default function ProductPagination({ page, totalPages, filters }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    function goTo(p: number) {
        const params = new URLSearchParams()
        for (const [k, v] of Object.entries(filters)) {
            if (v && k !== 'page') params.set(k, v)
        }
        if (p > 1) params.set('page', String(p))
        startTransition(() => router.push(`${pathname}?${params.toString()}`))
    }

    // Build page number list with ellipsis
    function getPages(): (number | '…')[] {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
        if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages]
        if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
        return [1, '…', page - 1, page, page + 1, '…', totalPages]
    }

    return (
        <div className={`flex items-center justify-between text-sm ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
            <p className="text-gray-500">
                Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => goTo(page - 1)}
                    disabled={page === 1}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                {getPages().map((p, i) =>
                    p === '…' ? (
                        <span key={`ellipsis-${i}`} className="px-1.5 text-gray-400 select-none">…</span>
                    ) : (
                        <Button
                            key={p}
                            variant={p === page ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            onClick={() => goTo(p as number)}
                        >
                            {p}
                        </Button>
                    )
                )}

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => goTo(page + 1)}
                    disabled={page === totalPages}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}