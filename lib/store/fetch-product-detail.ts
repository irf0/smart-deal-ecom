import { createClient } from '@/lib/supabase/client'
import type { StorefrontProduct } from '@/lib/types'

export type ProductDetail = {
    product_id: string
    brand: string
    model: string
    slug: string
    description: string | null
    specs: string | null
    ram_gb: number | null
    storage_gb: number | null
    network_type: string | null
    os: string | null
    color: string | null
    category: string
    images: { url: string; position: number }[]
    variants: {
        variant_id: string
        condition: StorefrontProduct['condition']
        price: number
        original_price: number | null
        stock_count: number
        battery_health: number | null
    }[]
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
    const supabase = createClient()
    console.log('fetching slug:', slug)


    const { data, error } = await supabase
        .from('products')
        .select(`
            id,
            brand,
            model,
            slug,
            description,
            specs,
            ram_gb,
            storage_gb,
            network_type,
            os,
            color,
            categories (
                name
            ),
            product_images (
                url,
                position
            ),
            product_variants (
                id,
                condition,
                price,
                original_price,
                stock_count,
                battery_health,
                status
            )
        `)
        .eq('slug', slug)
        .single()

    if (error || !data) return null

    const images = (data.product_images as any[])
        .sort((a, b) => a.position - b.position)

    const variants = (data.product_variants as any[])
        .filter(v => v.status === 'available' && v.stock_count > 0)
        .sort((a, b) => a.price - b.price)
        .map(v => ({
            variant_id: v.id,
            condition: v.condition,
            price: v.price,
            original_price: v.original_price,
            stock_count: v.stock_count,
            battery_health: v.battery_health,
        }))

    return {
        product_id: data.id,
        brand: data.brand,
        model: data.model,
        slug: data.slug,
        description: data.description,
        specs: data.specs,
        ram_gb: data.ram_gb,
        storage_gb: data.storage_gb,
        network_type: data.network_type,
        os: data.os,
        color: data.color,
        category: (data.categories as any)?.name ?? '',
        images,
        variants,
    }
}