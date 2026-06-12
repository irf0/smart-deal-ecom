'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export default function Navbar() {
    const [mounted, setMounted] = useState(false)
    const itemCount = useCartStore(state => state.totalItems())

    useEffect(() => setMounted(true), [])

    return (
        <nav className="bg-[#0F172A] sticky top-0 z-50 border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-white font-bold text-xl tracking-tight">
                    Smart<span className="text-[#2563EB]">Deal</span>
                </Link>

                <Link href="/cart" className="relative text-white hover:text-brand-blue transition-colors">
                    <ShoppingCart size={22} />
                    {mounted && itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#6366F1] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                            {itemCount}
                        </span>
                    )}
                </Link>
            </div>
        </nav>
    )
}