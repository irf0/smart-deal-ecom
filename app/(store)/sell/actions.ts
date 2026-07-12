'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'

type SellRequestInput = {
    deviceType: string
    customerName: string
    customerWhatsapp: string
    brand: string
    model: string
    yearOfPurchase: number | null
    storageGb: number | null
    ramGb: number | null
    processor: string | null
    screenCondition: string | null
    bodyCondition: string | null
    functionalIssues: string[]
    batteryHealthPercent: number | null
    hasAccessories: boolean
    hasOriginalBox: boolean
    expectedPrice: number | null
    notes: string | null
    imageUrls: string[]
}

export async function submitSellRequest(input: SellRequestInput) {
    if (!input.customerName?.trim()) throw new Error('Name is required')
    if (!input.customerWhatsapp?.trim()) throw new Error('WhatsApp number is required')
    if (!input.brand?.trim()) throw new Error('Brand is required')
    if (!input.model?.trim()) throw new Error('Model is required')
    if (!input.deviceType?.trim()) throw new Error('Device type is required')

    const { error } = await supabaseAdmin.from('sell_requests').insert({
        device_type: input.deviceType,
        customer_name: input.customerName.trim(),
        customer_whatsapp: input.customerWhatsapp.trim(),
        brand: input.brand.trim(),
        model: input.model.trim(),
        year_of_purchase: input.yearOfPurchase,
        storage_gb: input.storageGb,
        ram_gb: input.ramGb,
        processor: input.processor,
        screen_condition: input.screenCondition,
        body_condition: input.bodyCondition,
        functional_issues: input.functionalIssues,
        battery_health_percent: input.batteryHealthPercent,
        has_accessories: input.hasAccessories,
        has_original_box: input.hasOriginalBox,
        expected_price: input.expectedPrice,
        notes: input.notes,
        image_urls: input.imageUrls,
        status: 'new',
    })

    if (error) throw new Error(error.message)
}
