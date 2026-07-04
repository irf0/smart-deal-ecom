import { BadgeCheck, ShieldCheck, RefreshCcw, Tags } from 'lucide-react'

const items = [
  { label: '40-Point Quality Check', Icon: BadgeCheck, tint: 'bg-[#FFE8DC] text-[#D4532A]' },
  { label: '6-Month Warranty', Icon: ShieldCheck, tint: 'bg-[#FFF0D4] text-[#C47A12]' },
  { label: '7-Day Replacement', Icon: RefreshCcw, tint: 'bg-[#FFE4E8] text-[#C43A52]' },
  { label: 'Graded Condition', Icon: Tags, tint: 'bg-[#E4F4EA] text-[#3A8F5C]' },
] as const

export default function TrustStrip() {
  return (
    <section aria-label="Trust guarantees" className="max-w-6xl mx-auto px-4">
      {/* Trust strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {items.map(({ label, Icon, tint }) => (
          <div
            key={label}
            className="rounded-neu-sm bg-surface-light border border-black/5 neu-raised p-4 flex flex-col items-center text-center gap-2.5"
          >
            <div
              className={`w-11 h-11 rounded-neu-sm flex items-center justify-center neu-raised-sm ${tint}`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <p className="text-xs md:text-sm font-semibold text-ink leading-snug">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
