'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useDebouncedCallback } from 'use-debounce'

interface Props {
    current: {
        status?: string
        from?: string
        to?: string
        q?: string
        page?: string
    }
}

export default function OrderFilters({ current }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    function push(updates: Record<string, string | undefined>) {
        const params = new URLSearchParams()
        const merged = { ...current, ...updates, page: undefined }
        for (const [k, v] of Object.entries(merged)) {
            if (v) params.set(k, v)
        }
        startTransition(() => router.push(`${pathname}?${params.toString()}`))
    }

    const handleSearch = useDebouncedCallback((value: string) => {
        push({ q: value || undefined })
    }, 350)

    const activeCount = [current.q, current.from, current.to].filter(Boolean).length

    return (
        <div className={`flex flex-wrap items-center gap-2 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Search */}
            <Input
                defaultValue={current.q ?? ''}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search name, number, WhatsApp…"
                className="h-9 w-60 text-sm"
            />

            {/* Date from */}
            <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-500 shrink-0">From</label>
                <Input
                    type="date"
                    value={current.from ?? ''}
                    onChange={e => push({ from: e.target.value || undefined })}
                    className="h-9 w-36 text-sm cursor-pointer"
                />
            </div>

            {/* Date to */}
            <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-500 shrink-0">To</label>
                <Input
                    type="date"
                    value={current.to ?? ''}
                    onChange={e => push({ to: e.target.value || undefined })}
                    className="h-9 w-36 text-sm cursor-pointer"
                />
            </div>

            {/* Clear */}
            {activeCount > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => push({ q: undefined, from: undefined, to: undefined })}
                    className="h-9 gap-1.5 text-gray-500 cursor-pointer"
                >
                    <X className="w-3.5 h-3.5" />
                    Clear
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 ml-0.5">
                        {activeCount}
                    </Badge>
                </Button>
            )}
        </div>
    )
}