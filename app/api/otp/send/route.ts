import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

const COOLDOWN_SECONDS = 60
const MAX_ATTEMPTS = 3

export async function POST(req: NextRequest) {
    const { whatsappNumber } = await req.json()

    if (!whatsappNumber) {
        return NextResponse.json({ error: 'WhatsApp number is required' }, { status: 400 })
    }

    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const now = new Date()

    // check existing attempts for today
    const { data: existing } = await supabase
        .from('otp_attempts')
        .select('*')
        .eq('whatsapp_number', whatsappNumber)
        .eq('date', today)
        .single()

    if (existing) {
        // check max attempts
        if (existing.attempts >= MAX_ATTEMPTS) {
            return NextResponse.json(
                { error: 'Max OTP attempts reached. Try again tomorrow.' },
                { status: 429 }
            )
        }

        // check cooldown
        const lastSent = new Date(existing.last_sent_at)
        const secondsElapsed = (now.getTime() - lastSent.getTime()) / 1000

        if (secondsElapsed < COOLDOWN_SECONDS) {
            const waitSeconds = Math.ceil(COOLDOWN_SECONDS - secondsElapsed)
            return NextResponse.json(
                { error: `Please wait ${waitSeconds} seconds before retrying.` },
                { status: 429 }
            )
        }

        // increment attempts
        await supabase
            .from('otp_attempts')
            .update({ attempts: existing.attempts + 1, last_sent_at: now.toISOString() })
            .eq('id', existing.id)
    } else {
        // first attempt today
        await supabase
            .from('otp_attempts')
            .insert({ whatsapp_number: whatsappNumber, date: today })
    }

    // send OTP via MSG91
    const response = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authkey: process.env.MSG91_AUTH_KEY!,
        },
        body: JSON.stringify({
            template_id: process.env.MSG91_TEMPLATE_ID!,
            mobile: `91${whatsappNumber}`,
            otp_length: 6,
            otp_expiry: 10,
        }),
    })

    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}