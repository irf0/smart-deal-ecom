"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'

export function AvailableProductsCard() {
    const [count, setCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCount = async () => {
            const supabase = createClient()
            const { count, error } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'available')

            if (!error) setCount(count)
            setLoading(false)
        }

        fetchCount()
    }, [])

    return (
        <div className="rounded-xl border border-green-100 bg-green-50 p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-green-600">Available</p>
                <div className="rounded-lg bg-green-100 p-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
            </div>
            <p className="mt-3 text-3xl font-semibold text-green-700">
                {loading ? '—' : count ?? 0}
            </p>
        </div>
    )
}