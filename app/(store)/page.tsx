import { createClient } from '@/lib/supabase/server'
import Hero from '@/components/store/hero'
import CategoryCards from '@/components/store/category-cards'

export default async function HomePage() {
    const supabase = await createClient()

    const { data: products } = await supabase
        .from('products')
        .select(`
      *,
      categories(name, slug),
      product_images(url, position)
    `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(10)

    // const hotDeals = products?.map(product => ({
    //     id: product.id,
    //     slug: product.slug,
    //     brand: product.brand,
    //     model: product.model,
    //     price: product.price,
    //     original_price: product.original_price,
    //     condition: product.condition,
    //     status: product.status,
    //     image: product.product_images
    //         ?.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null,
    //     category: (product.categories as any)?.name ?? '',
    // })) ?? []

    return (
        <div>
            <Hero />
            <CategoryCards />
        </div>
    )
}