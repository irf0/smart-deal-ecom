import Link from 'next/link'
import { ImageOff } from 'lucide-react'

export type FeaturedDeal = {
  product_id: string
  slug: string
  brand: string
  model: string
  image_url: string | null
  condition: 'grade_a' | 'grade_b_plus' | 'grade_b' | 'grade_c_plus' | 'grade_c'
  price: number
  original_price: number | null
}

function conditionToLabel(condition: FeaturedDeal['condition']): 'Excellent' | 'Good' | 'Fair' {
  if (condition === 'grade_a') return 'Excellent'
  if (condition === 'grade_b_plus' || condition === 'grade_b') return 'Good'
  return 'Fair'
}

function conditionPillClasses(label: ReturnType<typeof conditionToLabel>) {
  if (label === 'Excellent') return 'bg-[#E4F4EA] text-success border-success/30'
  if (label === 'Good') return 'bg-[#FFF0D4] text-[#C47A12] border-[#E8A317]/40'
  return 'bg-[#FFE8DC] text-ink-muted border-black/10'
}

function formatInr(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

export default function FeaturedDeals({ deals }: { deals: FeaturedDeal[] }) {
  return (
    <section id="products" className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="featured-deals">
      {/* Featured Deals */}
      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Hot right now</p>
          <h2 id="featured-deals" className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
            Featured Deals
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Fresh arrivals with transparent grading and real savings.
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
        {deals.map((deal) => {
          const title = `${deal.brand} ${deal.model}`
          const gradeLabel = conditionToLabel(deal.condition)
          const hasDiscount = !!deal.original_price && deal.original_price > deal.price
          const savingsPct = hasDiscount ? Math.round((1 - deal.price / (deal.original_price as number)) * 100) : null

          return (
            <Link
              key={deal.product_id}
              href={`/product/${deal.slug}`}
              className="group rounded-neu bg-surface-light border border-black/5 neu-raised neu-hover-lift overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {/* Flat + crisp inner content (required) */}
              <div className="relative aspect-[4/3] bg-surface-light/60">
                {deal.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={deal.image_url}
                    alt={title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-ink-muted gap-1">
                    <ImageOff className="w-6 h-6" aria-hidden="true" />
                    <span className="text-[10px] font-medium">No image</span>
                  </div>
                )}

                <span
                  className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${conditionPillClasses(gradeLabel)}`}
                >
                  {gradeLabel}
                </span>

                {savingsPct !== null && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success text-white">
                    Save {savingsPct}%
                  </span>
                )}
              </div>

              <div className="p-4">
                <p className="text-sm font-semibold text-ink leading-snug line-clamp-2">
                  {title}
                </p>

                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-accent font-semibold tabular-nums">
                    {formatInr(deal.price)}
                  </p>

                  {hasDiscount && (
                    <p className="text-xs tabular-nums text-strike line-through">
                      {formatInr(deal.original_price as number)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

