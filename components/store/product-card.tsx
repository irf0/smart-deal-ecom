import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type Props = {
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

const conditionColors: Record<string, string> = {
    like_new: 'bg-green-100 text-green-700',
    good: 'bg-blue-100 text-blue-700',
    fair: 'bg-yellow-100 text-yellow-700',
    poor: 'bg-red-100 text-red-700',
}

const conditionLabels: Record<string, string> = {
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
}

export default function ProductCard({
    slug, brand, model, price, original_price, condition, image, category
}: Props) {
    return (
        <Link href={`/products/${slug}`} className="group block">
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="aspect-square bg-gray-50 overflow-hidden">
                    {image ? (
                        <img
                            src={image}
                            alt={`${brand} ${model}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                            No image
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">{category}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conditionColors[condition]}`}>
                            {conditionLabels[condition]}
                        </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-3 leading-tight">
                        {brand} {model}
                    </h3>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg font-bold text-[#2563EB]">
                                ₹{price.toLocaleString('en-IN')}
                            </p>
                            {original_price && (
                                <p className="text-xs text-gray-400 line-through">
                                    ₹{original_price.toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>
                        <span className="text-xs font-medium text-[#6366F1] group-hover:underline">
                            View Deal →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}