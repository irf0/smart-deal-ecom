'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package } from 'lucide-react'

export function TotalProductsCard() {
    const [count, setCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCount = async () => {
            const supabase = createClient()
            const { count, error } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })

            if (!error) setCount(count)
            setLoading(false)
        }

        fetchCount()
    }, [])

    return (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-600">Total Products</p>
                <div className="rounded-lg bg-blue-100 p-2">
                    <Package className="h-4 w-4 text-blue-600" />
                </div>
            </div>
            <p className="mt-3 text-3xl font-semibold text-blue-700">
                {loading ? '—' : count ?? 0}
            </p>
        </div>
    )
}