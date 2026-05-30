import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/product-form'

export default async function NewProductPage() {
    const supabase = await createClient()
    const { data: categories } = await supabase.from('categories').select('*').order('name')

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
            <div>
                <h1 className="text-xl font-semibold">Add Product</h1>
                <p className="text-sm text-muted-foreground mt-1">Fill in the details to list a new product.</p>
            </div>

            <ProductForm categories={categories ?? []} />
        </div>
    )
}