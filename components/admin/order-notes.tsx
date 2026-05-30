'use client'

import { useState, useTransition, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'

interface Props {
    orderId: string
    initialNotes: string
}

export default function OrderNotes({ orderId, initialNotes }: Props) {
    const [notes, setNotes] = useState(initialNotes)
    const [saved, setSaved] = useState(true)
    const [isPending, startTransition] = useTransition()
    const lastSaved = useRef(initialNotes)
    const supabase = createClient()

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setNotes(e.target.value)
        setSaved(false)
    }

    function handleBlur() {
        if (notes === lastSaved.current) return
        startTransition(async () => {
            const { error } = await supabase
                .from('orders')
                .update({ notes: notes || null })
                .eq('id', orderId)
            if (error) {
                toast.error('Failed to save notes.')
                return
            }
            lastSaved.current = notes
            setSaved(true)
        })
    }

    return (
        <div className="space-y-1.5">
            <Textarea
                value={notes}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={4}
                placeholder="Add internal notes… (auto-saved)"
                className="resize-none text-sm"
            />
            <div className="flex items-center gap-1.5 h-4 text-xs text-muted-foreground">
                {isPending && <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>}
                {!isPending && saved && notes !== '' && <><Check className="w-3 h-3 text-emerald-500" /> Saved</>}
            </div>
        </div>
    )
}