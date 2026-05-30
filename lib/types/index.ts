export type Category = {
    id: string
    name: string
    slug: string
    created_at: string
}

export type Product = {
    id: string
    category_id: string
    sku: string
    brand: string
    model: string
    slug: string
    condition: 'like_new' | 'good' | 'fair' | 'poor'
    price: number
    original_price: number | null
    description: string | null
    specs: string | null
    status: 'available' | 'unavailable'
    stock_count: number
    created_at: string
    updated_at: string
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
    product_id: string
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
    identifier_id: string | null
    price: number
    created_at: string
}