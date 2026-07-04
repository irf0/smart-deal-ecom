'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

const NAV_LINKS = [
  { label: 'Smartphones', href: '/product?category=Phones' },
  { label: 'Laptops', href: '/product?category=Laptops' },
  { label: 'Tablets', href: '/product?category=Tablets' },
  { label: 'Accessories', href: '/product?category=Accessories' },
] as const

function GlintDealsLink({
  className = '',
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  return (
    <Link
      href="/#products"
      onClick={onClick}
      className={`relative text-base font-semibold text-accent hover:text-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 rounded-sm ${className}`}
    >
      <span className="relative inline-block overflow-hidden px-0.5">
        Deals
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 glint-shine"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.15) 65%, transparent 100%)',
          }}
        />
      </span>
    </Link>
  )
}

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-base font-medium text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-muted/50 focus-visible:ring-offset-2 rounded-sm"
    >
      {label}
    </Link>
  )
}

function CartButton() {
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartStore((state) => state.totalItems())

  useEffect(() => setMounted(true), [])

  return (
    <Link
      href="/cart"
      className="relative text-ink hover:text-accent transition-colors p-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-muted/50 focus-visible:ring-offset-2"
      aria-label="Shopping cart"
    >
      <ShoppingCart size={22} />
      {mounted && itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-accent text-surface-light text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-bold">
          {itemCount}
        </span>
      )}
    </Link>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-surface backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-full relative flex items-center justify-between">
        {/* LEFT — Logo */}
        <Link
          href="/"
          className="text-ink font-semibold tracking-tight uppercase text-lg md:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-muted/50 focus-visible:ring-offset-2 rounded-sm"
        >
          SMART <span className="text-accent">DEAL</span>
        </Link>

        {/* CENTER — Desktop navigation (visually centered) */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8"
        >
          {NAV_LINKS.map((link) => (
            <NavLink key={link.label} href={link.href} label={link.label} />
          ))}
          <GlintDealsLink />
        </nav>

        {/* RIGHT — Cart + mobile toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden p-2 text-ink hover:text-accent rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-muted/50 focus-visible:ring-offset-2"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <CartButton />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-surface-dark/60 bg-surface-light/95 backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                href={link.href}
                label={link.label}
                onClick={closeMobile}
              />
            ))}
            <GlintDealsLink onClick={closeMobile} className="text-base" />
          </div>
        </nav>
      )}
    </header>
  )
}