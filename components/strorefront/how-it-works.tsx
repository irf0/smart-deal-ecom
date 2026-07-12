import { ClipboardCheck, BadgeCheck, Truck, ShieldCheck } from 'lucide-react'

const steps = [
  { title: 'Inspect', description: 'A detailed diagnostic and cosmetic review.', Icon: ClipboardCheck, tint: 'bg-[#FFE8DC] text-[#D4532A]' },
  { title: 'Certify', description: 'We grade condition and verify key components.', Icon: BadgeCheck, tint: 'bg-[#FFF0D4] text-[#C47A12]' },
  { title: 'Deliver', description: 'Secure packing with reliable delivery updates.', Icon: Truck, tint: 'bg-[#FFE4E8] text-[#C43A52]' },
  { title: 'Warranty-back', description: 'Support backed by a 6-month warranty.', Icon: ShieldCheck, tint: 'bg-[#E4F4EA] text-[#3A8F5C]' },
] as const

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="how-it-works-heading">
      {/* How It Works */}
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Simple & safe</p>
        <h2 id="how-it-works-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
          How it works
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          A clear path from inspection to your doorstep — built for peace of mind.
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s) => (
          <li key={s.title} className="rounded-neu bg-surface-light border border-black/5 neu-raised neu-hover-lift p-5" >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-neu-sm flex items-center justify-center shrink-0 neu-raised-sm ${s.tint}`}>
                <s.Icon className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-4 text-sm font-bold text-ink">{s.title}</p>
            <p className="mt-1 text-sm text-ink-muted leading-relaxed">{s.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
