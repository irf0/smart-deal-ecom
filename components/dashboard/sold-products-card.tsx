"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag } from 'lucide-react'

export function SoldProductsCard() {
    const [count, setCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCount = async () => {
            const supabase = createClient()
            const { count, error } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'unavailable')

            if (!error) setCount(count)
            setLoading(false)
        }

        fetchCount()
    }, [])

    return (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-amber-600">Sold</p>
                <div className="rounded-lg bg-amber-100 p-2">
                    <ShoppingBag className="h-4 w-4 text-amber-600" />
                </div>
            </div>
            <p className="mt-3 text-3xl font-semibold text-amber-700">
                {loading ? '—' : count ?? 0}
            </p>
        </div>
    )
}