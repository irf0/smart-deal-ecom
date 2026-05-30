'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    phone: string
    orderNumber: number
    customerName: string
}

export default function WhatsAppButton({ phone, orderNumber, customerName }: Props) {
    function open() {
        // Strip non-digits, ensure country code present
        const digits = phone.replace(/\D/g, '')
        const normalized = digits.startsWith('91') ? digits : `91${digits}`
        const message = encodeURIComponent(
            `Hi ${customerName}, this is regarding your Smart Deal order #${orderNumber}. `
        )
        window.open(`https://wa.me/${normalized}?text=${message}`, '_blank')
    }

    return (
        <Button
            onClick={open}
            className="gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white cursor-pointer shrink-0"
        >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
        </Button>
    )
}