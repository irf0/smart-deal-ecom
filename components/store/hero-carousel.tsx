'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

const slides = [
  {
    id: 'deals',
    eyebrow: 'Limited-time picks',
    title: 'Certified gadgets.',
    highlight: 'Real savings.',
    subtitle: 'Phones, laptops & tablets — inspected, graded, and ready to ship.',
    cta: 'Shop deals',
    href: '#products',
    gradient: 'from-[#D4532A] via-[#E8783A] to-[#E8A317]',
  },
  {
    id: 'warranty',
    eyebrow: 'Buy with confidence',
    title: '6-month warranty',
    highlight: 'on every device.',
    subtitle: 'Repairs and support when you need them — no guesswork.',
    cta: 'Browse catalog',
    href: '/product',
    gradient: 'from-[#B8431F] via-[#D4532A] to-[#C45C3A]',
  },
  {
    id: 'quality',
    eyebrow: 'Trust built in',
    title: '40-point quality check',
    highlight: 'before listing.',
    subtitle: 'Battery, display, ports & more — transparent grades you can trust.',
    cta: 'See how it works',
    href: '#how-it-works',
    gradient: 'from-[#8B3A12] via-[#D4532A] to-[#E8A317]',
  },
] as const

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return () => emblaApi.off('select', onSelect)

    const interval = window.setInterval(() => emblaApi.scrollNext(), 6000)
    return () => {
      emblaApi.off('select', onSelect)
      window.clearInterval(interval)
    }
  }, [emblaApi])

  return (
    <section className="py-6 md:py-10" aria-label="Featured promotions">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-neu-lg neu-raised">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {slides.map((slide) => (
                <div key={slide.id} className="min-w-0 shrink-0 grow-0 basis-full">
                  <div
                    className={`relative min-h-[280px] md:min-h-[340px] bg-gradient-to-br ${slide.gradient} px-6 py-10 md:px-12 md:py-12`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
                    <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative max-w-xl">
                      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase text-white/85">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                        {slide.eyebrow}
                      </p>

                      <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                        {slide.title}{' '}
                        <span className="text-accent-warm">{slide.highlight}</span>
                      </h1>

                      <p className="mt-3 text-sm md:text-base text-white/85 leading-relaxed max-w-md">
                        {slide.subtitle}
                      </p>

                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Link
                          href={slide.href}
                          className="inline-flex items-center justify-center h-11 px-6 rounded-neu-sm bg-white text-accent font-semibold hover:bg-surface-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                        >
                          {slide.cta}
                        </Link>

                        <a
                          href={`https://wa.me/${process.env.NEXT_PUBLIC_SHOP_WHATSAPP}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-11 px-6 rounded-neu-sm border-2 border-white/70 text-white font-semibold hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                        >
                          Chat on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ChevronLeft className="w-5 h-5 mx-auto" />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ChevronRight className="w-5 h-5 mx-auto" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  selectedIndex === index ? 'w-7 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
