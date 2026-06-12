'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const categories = [
    { label: 'All', value: '' },
    { label: 'Phones', value: 'phones' },
    { label: 'Laptops', value: 'laptops' },
    { label: 'Tablets', value: 'tablets' },
    { label: 'Accessories', value: 'accessories' },
]

export default function CategoryFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const active = searchParams.get('category') ?? ''

    function handleClick(value: string) {
        const params = new URLSearchParams(searchParams?.toString())
        if (value) {
            params.set('category', value)
        } else {
            params.delete('category')
        }
        router.push(`/?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
                <button
                    key={cat.value}
                    onClick={() => handleClick(cat.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${active === cat.value
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB]'
                        }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    )
}