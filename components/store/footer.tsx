import Link from 'next/link'
import { MessageCircle, MapPin, ShieldCheck, RotateCcw, HelpCircle } from 'lucide-react'

export default function Footer() {
    const whatsapp = process.env.NEXT_PUBLIC_SHOP_WHATSAPP ?? '#'
    const location = process.env.NEXT_PUBLIC_SHOP_LOCATION ?? 'Assam, India'
    const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? 'Smart Deal'

    return (
        <>
            <footer className="mt-14 border-t border-black/5 bg-[#E8DDD0] text-ink">
                {/* Footer (flat, no shadows) */}
                <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

                    <div>
                        <h3 className="text-ink font-bold text-lg tracking-tight">
                            Smart<span className="text-accent">Deal</span>
                        </h3>
                        <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                            SmartDeal is a trust-first marketplace for certified second-hand phones, laptops, tablets and accessories.
                            Every listing is inspected, graded, and backed by warranty.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-ink font-semibold mb-3">Shop</h4>
                        <ul className="space-y-2 text-sm text-ink-muted">
                            <li><Link href="/" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex">Home</Link></li>
                            <li><Link href="/product" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex">All products</Link></li>
                            <li><Link href="/cart" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex">Cart</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-ink font-semibold mb-3">Support</h4>
                        <ul className="space-y-2 text-sm text-ink-muted">
                            <li className="flex items-center gap-2">
                                <ShieldCheck size={14} className="text-accent" aria-hidden="true" />
                                <a href="/warranty" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex">
                                    Warranty
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <RotateCcw size={14} className="text-accent" aria-hidden="true" />
                                <a href="/returns" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex">
                                    Returns
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <HelpCircle size={14} className="text-accent" aria-hidden="true" />
                                <a href="/faq" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex">
                                    FAQ
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <MessageCircle size={14} className="text-accent" aria-hidden="true" />
                                <a href="/contact" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-ink font-semibold mb-3">Get in touch</h4>
                        <ul className="space-y-2 text-sm text-ink-muted">
                            <li className="flex items-center gap-2">
                                <MessageCircle size={14} className="text-success" aria-hidden="true" />
                                <a
                                    href={`https://wa.me/${whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-neu-sm px-1 py-0.5 inline-flex"
                                >
                                    {whatsapp}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin size={14} className="text-accent" aria-hidden="true" />
                                <span>{location}</span>
                            </li>
                        </ul>
                    </div>

                </div>
                <div className="border-t border-black/5 text-center py-4 text-xs text-ink-muted">
                    © {new Date().getFullYear()} {shopName}. All rights reserved.
                </div>
            </footer>
        </>
    )
}