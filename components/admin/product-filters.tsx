'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Category } from '@/lib/types'
import { useDebouncedCallback } from 'use-debounce'

interface Props {
    categories: Category[]
    current: {
        category?: string
        condition?: string
        status?: string
        in_stock?: string
        q?: string
    }
}

const ALL = '__all__'

export default function ProductFilters({ categories, current }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const activeCount = [
        current.category,
        current.condition,
        current.status,
        current.in_stock,
        current.q,
    ].filter(Boolean).length

    const push = useCallback(
        (updates: Record<string, string | undefined>) => {
            const params = new URLSearchParams()
            const merged = { ...current, ...updates, page: undefined }
            for (const [k, v] of Object.entries(merged)) {
                if (v) params.set(k, v)
            }
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`)
            })
        },
        [current, pathname, router]
    )

    const handleSearch = useDebouncedCallback((value: string) => {
        push({ q: value || undefined })
    }, 350)

    const clearAll = () => {
        startTransition(() => router.push(pathname))
    }

    return (
        <div className={`flex flex-wrap items-center gap-2 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Search */}
            <Input
                defaultValue={current.q ?? ''}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search brand or model…"
                className="h-9 w-52 text-sm"
            />

            {/* Category */}
            <Select
                value={current.category ?? ALL}
                onValueChange={v => push({ category: v === ALL ? undefined : v })}
            >
                <SelectTrigger className="h-9 w-40 text-sm cursor-pointer">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All categories</SelectItem>
                    {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Condition */}
            <Select
                value={current.condition ?? ALL}
                onValueChange={v => push({ condition: v === ALL ? undefined : v })}
            >
                <SelectTrigger className="h-9 w-36 text-sm cursor-pointer">
                    <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All conditions</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
            </Select>

            {/* Status */}
            <Select
                value={current.status ?? ALL}
                onValueChange={v => push({ status: v === ALL ? undefined : v })}
            >
                <SelectTrigger className="h-9 w-36 text-sm cursor-pointer">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
            </Select>

            {/* In Stock toggle */}
            <button
                onClick={() => push({ in_stock: current.in_stock === '1' ? undefined : '1' })}
                className={`h-9 px-3 rounded-md border text-sm font-medium transition-colors cursor-pointer
                    ${current.in_stock === '1'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
            >
                In stock only
            </button>

            {/* Clear all */}
            {activeCount > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
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