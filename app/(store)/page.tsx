import { createClient } from '@/lib/supabase/server'
import Hero from '@/components/store/hero'
import CategoryCards from '@/components/store/category-cards'
import TrustStrip from '@/components/store/trust-strip'
import FeaturedDeals, { type FeaturedDeal } from '@/components/store/featured-deals'
import HowItWorks from '@/components/store/how-it-works'
// import Testimonials, { type Testimonial } from '@/components/store/testimonials'

type HomeProductRow = {
    id: string
    brand: string
    model: string
    slug: string
    product_images: { url: string; position: number }[] | null
    product_variants: {
        id: string
        condition: FeaturedDeal['condition']
        price: number
        original_price: number | null
        stock_count: number
        status: 'available' | 'unavailable'
    }[] | null
}

export default async function HomePage() {
    const supabase = await createClient()

    const { data: products } = await supabase
        .from('products')
        .select(`
      id,
      brand,
      model,
      slug,
      status,
      created_at,
      categories(name, slug),
      product_images(url, position),
      product_variants(id, condition, price, original_price, stock_count, status)
    `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(10)

    // Featured deals (real data, not hardcoded)
    const rows = (products ?? []) as unknown as HomeProductRow[]
    const featuredDeals = rows
        .map((p): FeaturedDeal | null => {
            const variants = p.product_variants ?? []
            const availableVariants = variants
                .filter(v => v.status === 'available' && v.stock_count > 0)
                .sort((a, b) => a.price - b.price)

            const best = availableVariants[0]
            if (!best) return null

            const images = (p.product_images ?? [])
                .slice()
                .sort((a, b) => a.position - b.position)
            const firstImage = images[0]?.url ?? null

            return {
                product_id: p.id,
                slug: p.slug,
                brand: p.brand,
                model: p.model,
                image_url: firstImage,
                condition: best.condition,
                price: best.price,
                original_price: best.original_price,
            }
        })
        .filter((x): x is FeaturedDeal => x !== null)

    return (
        <div className="bg-surface text-ink">

            {/* 1) Hero */}
            <Hero />

            {/* 2) Trust strip */}
            <div className="pb-8 md:pb-10">
                <TrustStrip />
            </div>

            {/* 3) Shop by Category */}
            <CategoryCards />

            {/* 4) Featured Deals */}
            <FeaturedDeals deals={featuredDeals} />

            {/* 5) How It Works */}
            <HowItWorks />

            {/* 6) Testimonials (wired, but intentionally not rendered yet) */}
            {/*
            const testimonials: Testimonial[] = [
              // Add real reviews here when ready.
            ]
            <Testimonials testimonials={testimonials} />
            */}

        </div>
    )
}