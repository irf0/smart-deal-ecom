"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock } from 'lucide-react'

export function PendingOrdersCard() {
    const [count, setCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCount = async () => {
            const supabase = createClient()
            const { count, error } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'new')

            if (!error) setCount(count)
            setLoading(false)
        }

        fetchCount()
    }, [])

    return (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-600">Pending Orders</p>
                <div className="rounded-lg bg-red-100 p-2">
                    <Clock className="h-4 w-4 text-red-600" />
                </div>
            </div>
            <p className="mt-3 text-3xl font-semibold text-red-700">
                {loading ? '—' : count ?? 0}
            </p>
        </div>
    )
}