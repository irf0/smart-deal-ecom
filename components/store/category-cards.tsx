import Link from 'next/link'
import { Smartphone, Laptop, Tablet, Headphones } from 'lucide-react'

const categories = [
    {
        label: 'Phones',
        slug: 'phones',
        icon: Smartphone,
        color: 'bg-blue-50 text-[#2563EB]',
        description: 'iPhones, Androids & more'
    },
    {
        label: 'Laptops',
        slug: 'laptops',
        icon: Laptop,
        color: 'bg-indigo-50 text-[#6366F1]',
        description: 'MacBooks, ThinkPads & more'
    },
    {
        label: 'Tablets',
        slug: 'tablets',
        icon: Tablet,
        color: 'bg-purple-50 text-purple-600',
        description: 'iPads, Android tablets & more'
    },
    {
        label: 'Accessories',
        slug: 'accessories',
        icon: Headphones,
        color: 'bg-green-50 text-green-600',
        description: 'Chargers, cases & more'
    },
]

export default function CategoryCards() {
    return (
        <section className="max-w-6xl mx-auto px-4 py-12">
            <div className='flex justify-between items-baseline mb-6'>
                <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                <Link href='/product'>
                    <h2 className="text-md font-bold text-gray-900">View All</h2>
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(cat => {
                    const Icon = cat.icon
                    return (
                        <Link
                            key={cat.slug}
                            href={`/products?category=${cat.slug}`}
                            className="group bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.color}`}>
                                <Icon size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{cat.label}</h3>
                            <p className="text-xs text-gray-400">{cat.description}</p>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}