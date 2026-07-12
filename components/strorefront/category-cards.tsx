import Link from 'next/link'
import { Smartphone, Laptop, Tablet, Headphones } from 'lucide-react'

const categories = [
  {
    label: 'Phones',
    slug: 'Phones',
    icon: Smartphone,
    tint: 'bg-[#FFE8DC] text-[#D4532A]',
    description: 'iPhones & Android',
  },
  {
    label: 'Laptops',
    slug: 'Laptops',
    icon: Laptop,
    tint: 'bg-[#FFF0D4] text-[#C47A12]',
    description: 'MacBooks & more',
  },
  {
    label: 'Tablets',
    slug: 'Tablets',
    icon: Tablet,
    tint: 'bg-[#FFE4E8] text-[#C43A52]',
    description: 'iPads & Android',
  },
  {
    label: 'Accessories',
    slug: 'Accessories',
    icon: Headphones,
    tint: 'bg-[#E4F4EA] text-[#3A8F5C]',
    description: 'Cases & chargers',
  },
]

export default function CategoryCards() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      {/* Shop by Category */}
      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
            Shop by Category
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Jump straight into what you&apos;re looking for.
          </p>
        </div>

        <Link
          href="/product"
          className="text-sm font-semibold text-accent hover:text-accent-hover underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-2 py-1"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/product?category=${cat.slug}`}
              className="group aspect-square rounded-neu bg-surface-light border border-black/5 neu-raised neu-hover-lift p-4 flex flex-col items-center justify-center text-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-neu-sm flex items-center justify-center neu-raised-sm ${cat.tint}`}
              >
                <Icon size={28} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-ink text-base md:text-lg">{cat.label}</h3>
                <p className="text-xs text-ink-muted mt-0.5">{cat.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
