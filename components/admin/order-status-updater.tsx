'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'

type Status = 'new' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'

const STEPS: { value: Status; label: string; color: string; active: string }[] = [
    { value: 'new', label: 'New', color: 'border-blue-200 text-blue-600', active: 'bg-blue-600 border-blue-600 text-white' },
    { value: 'confirmed', label: 'Confirmed', color: 'border-amber-200 text-amber-600', active: 'bg-amber-600 border-amber-600 text-white' },
    { value: 'shipped', label: 'Shipped', color: 'border-purple-200 text-purple-600', active: 'bg-purple-600 border-purple-600 text-white' },
    { value: 'completed', label: 'Completed', color: 'border-emerald-200 text-emerald-600', active: 'bg-emerald-600 border-emerald-600 text-white' },
]

interface Props {
    orderId: string
    currentStatus: string
}

export default function OrderStatusUpdater({ orderId, currentStatus }: Props) {
    const [status, setStatus] = useState<string>(currentStatus)
    const [isPending, startTransition] = useTransition()
    const supabase = createClient()

    const isCancelled = status === 'cancelled'

    function update(next: Status) {
        if (next === status || isPending) return
        startTransition(async () => {
            const { error } = await supabase
                .from('orders')
                .update({ status: next })
                .eq('id', orderId)
            if (error) { toast.error('Failed to update status.'); return }
            setStatus(next)
            toast.success(`Order marked as ${next}.`)
        })
    }

    async function cancel() {
        if (isPending) return
        startTransition(async () => {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', orderId)
            if (error) { toast.error('Failed to cancel order.'); return }
            setStatus('cancelled')
            toast.success('Order cancelled.')
        })
    }

    async function restore() {
        if (isPending) return
        startTransition(async () => {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'new' })
                .eq('id', orderId)
            if (error) { toast.error('Failed to restore order.'); return }
            setStatus('new')
            toast.success('Order restored.')
        })
    }

    const currentIndex = STEPS.findIndex(s => s.value === status)

    return (
        <div className={`rounded-lg border p-4 space-y-4 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
            {isPending && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" /> Updating…
                </div>
            )}

            {isCancelled ? (
                <div className="space-y-3">
                    <p className="text-sm font-medium text-red-600">Order cancelled</p>
                    <button
                        onClick={restore}
                        className="w-full text-sm rounded border px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Restore as New
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {STEPS.map((step, i) => {
                        const isDone = i < currentIndex
                        const isActive = step.value === status
                        const isNext = i === currentIndex + 1

                        return (
                            <button
                                key={step.value}
                                onClick={() => update(step.value)}
                                disabled={isDone || isActive}
                                className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left
                                    ${isActive ? step.active : ''}
                                    ${isDone ? 'opacity-40 cursor-default border-gray-100 text-gray-400' : ''}
                                    ${isNext ? 'cursor-pointer hover:bg-gray-50 ' + step.color : ''}
                                    ${!isActive && !isDone && !isNext ? 'cursor-default opacity-30 border-gray-100 text-gray-400' : ''}
                                `}
                            >
                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-xs
                                    ${isActive ? 'border-white' : isDone ? 'border-gray-300 bg-gray-200' : 'border-current'}`}>
                                    {isDone || isActive ? <Check className="w-3 h-3" /> : null}
                                </span>
                                {step.label}
                                {isNext && (
                                    <span className="ml-auto text-xs opacity-60">Mark →</span>
                                )}
                            </button>
                        )
                    })}
                </div>
            )}

            {!isCancelled && status !== 'completed' && (
                <>
                    <div className="border-t pt-3">
                        <button
                            onClick={cancel}
                            className="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded px-3 py-2 transition-colors cursor-pointer text-left"
                        >
                            Cancel order
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}