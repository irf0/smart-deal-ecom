import type { StorefrontProduct } from '@/lib/types'

export const CATEGORIES = ['All', 'Phones', 'Laptops', 'Tablets', 'Audio / Earphones', 'Accessories']
export const CONDITIONS = ['grade_a', 'grade_b_plus', 'grade_b', 'grade_c_plus', 'grade_c'] as const
export const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Sony', 'Dell', 'HP', 'Lenovo', 'Xiaomi', 'Realme', 'Nothing']
export const RAM = [2, 4, 6, 8, 12, 16, 32]
export const STORAGE = [16, 32, 64, 128, 256, 512, 1024]
export const NETWORK = ['4G', '5G', 'WiFi Only']
export const OS_LIST = ['Android', 'iOS', 'Windows', 'macOS', 'Other']
export const COLORS = ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Green', 'Purple', 'Red', 'Yellow', 'Pink']

export const SORT_OPTIONS = [
    { label: 'Newest first', value: 'newest' },
    { label: 'Price: Low → High', value: 'price_asc' },
    { label: 'Price: High → Low', value: 'price_desc' },
]

// Human-readable condition labels
export const CONDITION_LABELS: Record<StorefrontProduct['condition'], string> = {
    grade_a: 'Grade A',
    grade_b_plus: 'Grade B+',
    grade_b: 'Grade B',
    grade_c_plus: 'Grade C+',
    grade_c: 'Grade C',
}

// Badge styles per condition
export const CONDITION_STYLES: Record<StorefrontProduct['condition'], string> = {
    grade_a: 'bg-green-50 text-green-700 border-green-200',
    grade_b_plus: 'bg-blue-50 text-blue-700 border-blue-200',
    grade_b: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    grade_c_plus: 'bg-orange-50 text-orange-700 border-orange-200',
    grade_c: 'bg-red-50 text-red-700 border-red-200',
}