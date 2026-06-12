'use server'

import { createClient } from '@/lib/supabase/server'

export type Coupon = {
    id: string
    code: string
    discount_percent: number
    min_cart_value: number
    max_discount_amount: number | null
}

/**
 * Returns all currently active, time-valid, usage-limit-valid coupons
 * where the cart total meets the minimum value requirement.
 * Used to show eligible banners and to validate applied coupon on the cart page.
 */
export async function getEligibleCoupons(cartTotal: number): Promise<Coupon[]> {
    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
        .from('coupons')
        .select('id, code, discount_percent, min_cart_value, max_discount_amount, usage_limit, times_used')
        .eq('active', true)
        .lte('valid_from', now)
        .gte('valid_until', now)
        .lte('min_cart_value', cartTotal)
        .order('discount_percent', { ascending: false })

    if (error) {
        console.error('[getEligibleCoupons]', error)
        return []
    }

    // Filter out exhausted usage-limit coupons (can't be done cleanly in Supabase query)
    return (data ?? [])
        .filter(c => c.usage_limit === null || c.times_used < c.usage_limit)
        .map(({ id, code, discount_percent, min_cart_value, max_discount_amount }) => ({
            id,
            code,
            discount_percent,
            min_cart_value,
            max_discount_amount,
        }))
}