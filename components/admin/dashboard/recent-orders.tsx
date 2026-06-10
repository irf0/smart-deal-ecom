'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
}

type Order = {
    id: string
    order_number: number
    customer_name: string
    customer_whatsapp: string
    status: string
    created_at: string
    item_count: number
}

export function RecentOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            const supabase = createClient()

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    customer_name,
                    customer_whatsapp,
                    status,
                    created_at,
                    order_items(count)
                `)
                .order('created_at', { ascending: false })
                .limit(10)

            if (!error && data) {
                setOrders(data.map((o: any) => ({
                    ...o,
                    item_count: o.order_items[0]?.count ?? 0,
                })))
            }
            setLoading(false)
        }

        fetchOrders()
    }, [])

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <div className="w-full bg-white rounded-lg border overflow-x-auto">
                <table className="min-w-full text-sm hidden md:table">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Order</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Customer</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">WhatsApp</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Items</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Status</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Date</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td>
                            </tr>
                        )}
                        {!loading && orders.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No orders yet.</td>
                            </tr>
                        )}
                        {orders.map(order => (
                            <tr key={order.id} className={`hover:bg-gray-50 ${order.status === 'new' ? 'bg-blue-50/50' : ''}`}>
                                <td className="px-4 py-3 font-medium">#{order.order_number}</td>
                                <td className="px-4 py-3">{order.customer_name}</td>
                                <td className="px-4 py-3 text-gray-500">{order.customer_whatsapp}</td>
                                <td className="px-4 py-3 text-gray-600">{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</td>
                                <td className="px-4 py-3">
                                    <Badge className={STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </td>
                                <td className="px-4 py-3">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/orders/${order.id}`}>View</Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Mobile cards */}
                <div className="md:hidden divide-y">
                    {loading && (
                        <p className="px-4 py-10 text-center text-gray-400">Loading...</p>
                    )}
                    {!loading && orders.length === 0 && (
                        <p className="px-4 py-10 text-center text-gray-400">No orders yet.</p>
                    )}
                    {orders.map(order => (
                        <div key={order.id} className={`p-4 flex items-center justify-between gap-3 ${order.status === 'new' ? 'bg-blue-50/50' : ''}`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">#{order.order_number}</span>
                                    <Badge className={STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                </div>
                                <p className="text-sm truncate">{order.customer_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {order.item_count} {order.item_count === 1 ? 'item' : 'items'} · {new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/orders/${order.id}`}>View</Link>
                            </Button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}