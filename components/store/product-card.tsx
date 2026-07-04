'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageOff } from 'lucide-react'
import { CONDITION_STYLES, CONDITION_LABELS } from '@/lib/constants/products'
import type { StorefrontProduct } from '@/lib/types'
import { useCartStore } from '@/store/cartStore'

function ProductImage({ src, alt }: { src: string; alt: string }) {
    const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')

    return (
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
            {state === 'loading' && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}

            {state === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-1.5">
                    <ImageOff className="w-6 h-6" />
                    <span className="text-[10px]">No image</span>
                </div>
            )}

            <img
                src={src}
                alt={alt}
                onLoad={() => setState('loaded')}
                onError={() => setState('error')}
                className={`w-full h-full object-cover transition-opacity duration-300 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'
                    }`}
            />
        </div>
    )
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
    const addItem = useCartStore(state => state.addItem)

    const title = `${product.brand} ${product.model}`

    const specs = [
        product.ram_gb ? `${product.ram_gb}GB RAM` : null,
        product.storage_gb ? `${product.storage_gb}GB` : null,
        product.network_type ?? null,
    ]
        .filter(Boolean)
        .join(' · ')

    const handleAddToCart = (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault()
        e.stopPropagation()

        addItem({
            product_id: product.product_id,
            variant_id: product.variant_id, // remove if your type doesn't have this
            brand: product.brand,
            model: product.model,
            condition: product.condition,
            condition_label: CONDITION_LABELS[product.condition],
            price: product.price,
            image_url: product.image_url ?? null,
            slug: product.slug,
        })

        console.log(useCartStore.getState().items)
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
            <Link
                href={`/product/${product.slug}`}
                className="flex flex-col flex-1"
            >
                <div className="relative">
                    <ProductImage
                        src={product.image_url ?? ''}
                        alt={title}
                    />

                    <span
                        className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CONDITION_STYLES[product.condition]}`}
                    >
                        {CONDITION_LABELS[product.condition]}
                    </span>

                    {product.original_price &&
                        product.original_price > product.price && (
                            <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">
                                {Math.round(
                                    (1 -
                                        product.price /
                                        product.original_price) *
                                    100
                                )}
                                % off
                            </span>
                        )}
                </div>

                <div className="p-3 flex flex-col gap-2 flex-1">
                    <div>
                        <p className="text-gray-900 font-semibold text-sm leading-snug line-clamp-2">
                            {title}
                        </p>

                        {specs && (
                            <p className="text-gray-400 text-[11px] mt-0.5">
                                {specs}
                            </p>
                        )}

                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-[#2563EB] font-bold text-base">
                                ₹{product.price.toLocaleString('en-IN')}
                            </p>

                            {product.original_price &&
                                product.original_price > product.price && (
                                    <p className="text-gray-400 text-xs line-through">
                                        ₹
                                        {product.original_price.toLocaleString(
                                            'en-IN'
                                        )}
                                    </p>
                                )}
                        </div>
                    </div>
                </div>
            </Link>

            <div className="px-3 pb-3">
                <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-xl py-2 transition-colors duration-200 cursor-pointer"
                >
                    Add To Cart
                </button>
            </div>
        </div>
    )
}