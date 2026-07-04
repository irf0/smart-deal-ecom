export type Testimonial = {
  name: string
  role?: string
  quote: string
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null

  return (
    <section className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="testimonials">
      {/* Testimonials */}
      <div className="max-w-2xl">
        <h2 id="testimonials" className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
          What customers say
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Real feedback from verified SmartDeal purchases.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <figure key={`${t.name}-${t.quote.slice(0, 12)}`} className="rounded-neu bg-surface border border-black/5 neu-raised p-5">
            <blockquote className="text-sm text-ink leading-relaxed">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-ink">
              {t.name}
              {t.role ? <span className="text-ink-muted font-medium"> · {t.role}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

