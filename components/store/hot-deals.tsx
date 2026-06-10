'use client'

import useEmblaCarousel from 'embla-carousel-react'
import ProductCard from './product-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Product = {
    id: string
    slug: string
    brand: string
    model: string
    price: number
    original_price: number | null
    condition: string
    status: string
    image: string | null
    category: string
}

export default function HotDeals({ products }: { products: Product[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 2 },
        }
    })

    return (
        <section className="py-12 bg-[#0F172A]">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">🔥 Hot Deals</h2>
                        <p className="text-white/50 text-sm mt-1">Latest arrivals at unbeatable prices</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => emblaApi?.scrollPrev()}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => emblaApi?.scrollNext()}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-4">
                        {products.map(product => (
                            <div key={product.id} className="flex-none w-[220px] md:w-[260px]">
                                <ProductCard {...product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}