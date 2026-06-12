'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageOff } from 'lucide-react'
import { CONDITION_STYLES, CONDITION_LABELS } from '@/lib/constants/products'
import type { StorefrontProduct } from '@/lib/types'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

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
    const title = `${product.brand} ${product.model}`
    console.log('product slug:', product.slug)

    const specs = [
        product.ram_gb ? `${product.ram_gb}GB RAM` : null,
        product.storage_gb ? `${product.storage_gb}GB` : null,
        product.network_type ?? null,
    ].filter(Boolean).join(' · ')

    function openWhatsApp(e: React.MouseEvent) {
        e.preventDefault()
        const msg = encodeURIComponent(
            `Hi, I'm interested in: ${title} (${CONDITION_LABELS[product.condition]})`
        )
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
            <Link href={`/product/${product.slug}`} className="flex flex-col flex-1">
                <div className="relative">
                    <ProductImage src={product.image_url ?? ''} alt={title} />
                    <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CONDITION_STYLES[product.condition]}`}>
                        {CONDITION_LABELS[product.condition]}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">
                            {Math.round((1 - product.price / product.original_price) * 100)}% off
                        </span>
                    )}
                </div>

                <div className="p-3 flex flex-col gap-2 flex-1">
                    <div>
                        <p className="text-gray-900 font-semibold text-sm leading-snug line-clamp-2">
                            {title}
                        </p>
                        {specs && (
                            <p className="text-gray-400 text-[11px] mt-0.5">{specs}</p>
                        )}
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-[#2563EB] font-bold text-base">
                                ₹{product.price.toLocaleString('en-IN')}
                            </p>
                            {product.original_price && product.original_price > product.price && (
                                <p className="text-gray-400 text-xs line-through">
                                    ₹{product.original_price.toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

            </Link>

            {/* WhatsApp button outside the Link */}
            <div className="px-3 pb-3">
                <button
                    onClick={openWhatsApp}
                    className="w-full flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-[#25D366] hover:text-white border border-gray-200 hover:border-[#25D366] text-gray-700 text-xs font-medium rounded-xl py-2 transition-colors duration-200"
                >
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        alt="WhatsApp"
                        className="w-3.5 h-3.5"
                    />
                    Contact Seller
                </button>
            </div>
        </div>
    )
}