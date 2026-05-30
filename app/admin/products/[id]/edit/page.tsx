import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/product-form'
import IMEISection from '@/components/admin/imei-section'
import { Separator } from '@/components/ui/separator'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const [{ data: product, error }, { data: categories }] = await Promise.all([
        supabase
            .from('products')
            .select('*, product_images(*), product_identifiers(*)')
            .eq('id', id)
            .single(),
        supabase.from('categories').select('*').order('name'),
    ])

    if (error || !product) notFound()

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
            <div>
                <h1 className="text-xl font-semibold">Edit Product</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {product.brand} {product.model}
                    <span className="mx-1.5 text-gray-300">·</span>
                    <span className="font-mono text-xs">{product.sku}</span>
                </p>
            </div>

            <ProductForm
                categories={categories ?? []}
                product={{
                    id: product.id,
                    category_id: product.category_id,
                    brand: product.brand,
                    model: product.model,
                    condition: product.condition,
                    price: product.price,
                    original_price: product.original_price,
                    description: product.description,
                    specs: product.specs,
                    status: product.status,
                    stock_count: product.stock_count,
                }}
                images={product.product_images}
            />

            <IMEISection
                productId={product.id}
                identifiers={product.product_identifiers}
            />
        </div>
    )
}