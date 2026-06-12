import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const { whatsappNumber, otp } = await req.json()

    if (!whatsappNumber || !otp) {
        return NextResponse.json(
            { error: 'WhatsApp number and OTP are required' },
            { status: 400 }
        )
    }

    // verify OTP via MSG91
    const response = await fetch(
        `https://control.msg91.com/api/v5/otp/verify?mobile=91${whatsappNumber}&otp=${otp}`,
        {
            method: 'GET',
            headers: {
                authkey: process.env.MSG91_AUTH_KEY!,
            },
        }
    )

    const result = await response.json()

    if (result.type !== 'success') {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // mark user as verified in Supabase
    const supabase = createClient()

    await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('whatsapp_number', whatsappNumber)

    return NextResponse.json({ success: true })
}