import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/product-form'

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (!product) notFound()

    const { data: categories } = await supabase
        .from('categories')
        .select('*')

    const { data: images } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('position')

    const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id)

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
            <ProductForm
                categories={categories ?? []}
                product={product}
                images={images ?? []}
                variants={variants ?? []}
            />
        </div>
    )
}