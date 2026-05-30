'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import type { OrderStatus } from '@/app/admin/orders/page'

const TABS: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
]

interface Props {
    active: OrderStatus | 'all'
    counts: Record<string, number>
}

export default function OrderTabs({ active, counts }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    function goTo(status: OrderStatus | 'all') {
        const params = new URLSearchParams()
        if (status !== 'all') params.set('status', status)
        startTransition(() => router.push(`${pathname}?${params.toString()}`))
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0)

    return (
        <div className={`flex gap-1 border-b ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
            {TABS.map(tab => {
                const count = tab.value === 'all' ? total : (counts[tab.value] ?? 0)
                const isActive = active === tab.value
                return (
                    <button
                        key={tab.value}
                        onClick={() => goTo(tab.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer
                            ${isActive
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                        {count > 0 && (
                            <span className={`text-xs rounded-full px-1.5 py-0.5 font-medium leading-none
                                ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {count}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}