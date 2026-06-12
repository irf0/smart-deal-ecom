'use client'

import { useState } from 'react'
import { ChevronLeft, ImageOff, BatteryMedium, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { CONDITION_LABELS, CONDITION_STYLES } from '@/lib/constants/products'
import type { ProductDetail } from '@/lib/store/fetch-product-detail'
import { useCartStore } from '@/store/cartStore'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ images, alt }: { images: { url: string; position: number }[]; alt: string }) {
    const [active, setActive] = useState(0)
    const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')

    if (images.length === 0) {
        return (
            <div className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2">
                <ImageOff className="w-10 h-10" />
                <span className="text-sm">No images available</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                {state === 'loading' && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                {state === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <ImageOff className="w-10 h-10" />
                        <span className="text-sm">Image unavailable</span>
                    </div>
                )}
                <img
                    key={images[active].url}
                    src={images[active].url}
                    alt={`${alt} - image ${active + 1}`}
                    onLoad={() => setState('loaded')}
                    onError={() => setState('error')}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {images.map((img, i) => (
                        <button
                            key={img.url}
                            onClick={() => { setActive(i); setState('loading') }}
                            className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === active
                                ? 'border-[#2563EB]'
                                : 'border-transparent hover:border-gray-300'
                                }`}
                        >
                            <img
                                src={img.url}
                                alt={`${alt} thumbnail ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Variant Selector ─────────────────────────────────────────────────────────

function VariantSelector({
    variants,
    selected,
    onChange,
}: {
    variants: ProductDetail['variants']
    selected: string
    onChange: (id: string) => void
}) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-800">Condition</p>
            <div className="flex flex-col gap-2">
                {variants.map(v => {
                    const isSelected = v.variant_id === selected
                    return (
                        <button
                            key={v.variant_id}
                            onClick={() => onChange(v.variant_id)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors text-left ${isSelected
                                ? 'border-[#2563EB] bg-[#2563EB]/5'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Condition badge */}
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CONDITION_STYLES[v.condition]}`}>
                                    {CONDITION_LABELS[v.condition]}
                                </span>

                                {/* Battery health if available */}
                                {v.battery_health !== null && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <BatteryMedium className="w-3.5 h-3.5" />
                                        {v.battery_health}% battery
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                <div className="text-right">
                                    <p className={`font-bold text-base ${isSelected ? 'text-[#2563EB]' : 'text-gray-900'}`}>
                                        ₹{v.price.toLocaleString('en-IN')}
                                    </p>
                                    {v.original_price && v.original_price > v.price && (
                                        <p className="text-gray-400 text-xs line-through">
                                            ₹{v.original_price.toLocaleString('en-IN')}
                                        </p>
                                    )}
                                </div>
                                {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Specs Block ──────────────────────────────────────────────────────────────

function SpecsBlock({ product }: { product: ProductDetail }) {
    const hardwareSpecs = [
        product.ram_gb ? { label: 'RAM', value: `${product.ram_gb}GB` } : null,
        product.storage_gb ? { label: 'Storage', value: product.storage_gb >= 1024 ? `${product.storage_gb / 1024}TB` : `${product.storage_gb}GB` } : null,
        product.network_type ? { label: 'Network', value: product.network_type } : null,
        product.os ? { label: 'OS', value: product.os } : null,
        product.color ? { label: 'Color', value: product.color } : null,
        product.category ? { label: 'Category', value: product.category } : null,
    ].filter(Boolean) as { label: string; value: string }[]

    return (
        <div className="flex flex-col gap-4">
            {/* Hardware specs grid */}
            {hardwareSpecs.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {hardwareSpecs.map(spec => (
                        <div key={spec.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{spec.label}</p>
                            <p className="text-sm font-semibold text-gray-800 mt-0.5">{spec.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Description */}
            {product.description && (
                <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1.5">Description</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {product.description}
                    </p>
                </div>
            )}

            {/* Specs */}
            {product.specs && (
                <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1.5">Specifications</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {product.specs}
                    </p>
                </div>
            )}
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetailClient({ product }: { product: ProductDetail }) {
    const addItem = useCartStore(state => state.addItem)
    const [selectedVariantId, setSelectedVariantId] = useState(
        product.variants[0]?.variant_id ?? ''
    )

    const selectedVariant = product.variants.find(v => v.variant_id === selectedVariantId)
    const title = `${product.brand} ${product.model}`


    function handleAddToCart() {
        if (!selectedVariant) return
        addItem({
            variant_id: selectedVariant.variant_id,
            product_id: product.product_id,
            brand: product.brand,
            model: product.model,
            condition: selectedVariant.condition,
            condition_label: CONDITION_LABELS[selectedVariant.condition],
            price: selectedVariant.price,
            image_url: product.images[0]?.url ?? null,
            slug: product.slug,
        })
        console.log(useCartStore.getState().items)
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-6">

                {/* Back link */}
                <Link
                    href="/product"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to listings
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left — gallery */}
                    <ImageGallery images={product.images} alt={title} />

                    {/* Right — info */}
                    <div className="flex flex-col gap-6">

                        {/* Title + category */}
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                                {product.category}
                            </p>
                            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                                {title}
                            </h1>
                        </div>

                        {/* Variant selector */}
                        {product.variants.length > 0 ? (
                            <VariantSelector
                                variants={product.variants}
                                selected={selectedVariantId}
                                onChange={setSelectedVariantId}
                            />
                        ) : (
                            <p className="text-sm text-gray-400 italic">No variants available</p>
                        )}
                        {/* CTA */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedVariant}
                            className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-3.5 transition-colors cursor-pointer"
                        >
                            {/* <ShoppingCart className="w-5 h-5" /> */}
                            Add to Cart
                        </button>

                        {/* Specs */}
                        <SpecsBlock product={product} />

                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}