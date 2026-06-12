export type Category = {
    id: string
    name: string
    slug: string
    created_at: string
}

export type StorefrontProduct = {
    // from product_variants
    variant_id: string
    condition: 'grade_a' | 'grade_b_plus' | 'grade_b' | 'grade_c_plus' | 'grade_c'
    price: number
    original_price: number | null
    stock_count: number
    battery_health: number | null
    // from products
    product_id: string
    brand: string
    model: string
    slug: string
    ram_gb: number | null
    storage_gb: number | null
    network_type: string | null
    os: string | null
    color: string | null
    // from categories
    category: string
    // from product_images
    image_url: string | null
}

export type ProductVariant = {
    id: string
    product_id: string
    condition: 'grade_a' | 'grade_b_plus' | 'grade_b' | 'grade_c_plus' | 'grade_c'
    price: number
    original_price: number | null
    stock_count: number
    battery_health: number | null
    status: 'available' | 'unavailable'
    created_at: string
}

export type ProductImage = {
    id: string
    product_id: string
    url: string
    position: number
    created_at: string
}

export type ProductIdentifier = {
    id: string
    variant_id: string
    identifier: string
    status: 'available' | 'sold'
    created_at: string
}

export type Order = {
    id: string
    order_number: number
    customer_name: string
    customer_whatsapp: string
    status: 'new' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'
    notes: string | null
    total_price: number
    created_at: string
    updated_at: string
}

export type OrderItem = {
    id: string
    order_id: string
    product_id: string
    variant_id: string
    identifier_id: string | null
    price: number
    created_at: string
}

export type User = {
    name: string;
    city: string;
    whatsapp: string
}

export type FetchState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: StorefrontProduct[] }
    | { status: 'error'; message: string; retryable: boolean }