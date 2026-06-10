import Link from 'next/link'
import { MessageCircle, MapPin } from 'lucide-react'

export default function Footer() {
    const whatsapp = process.env.NEXT_PUBLIC_SHOP_WHATSAPP ?? '#'
    const location = process.env.NEXT_PUBLIC_SHOP_LOCATION ?? 'Assam, India'
    const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? 'Smart Deal'

    return (
        <>
            <footer className="bg-[#0F172A] text-white/70 mt-16">
                <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

                    <div>
                        <h3 className="text-white font-bold text-lg mb-2">
                            Smart<span className="text-[#2563EB]">Deal</span>
                        </h3>
                        <p className="text-sm leading-relaxed">
                            Certified second hand gadgets at the best prices. Every device tested and verified.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-3">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-3">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <MessageCircle size={14} className="text-[#25D366]" />
                                <a
                                    href={`https://wa.me/${whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                >
                                    {whatsapp}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin size={14} className="text-brand-blue" />
                                <span>{location}</span>
                            </li>
                        </ul>
                    </div>

                </div>
                <div className="border-t border-white/10 text-center py-4 text-xs text-white/40">
                    © {new Date().getFullYear()} {shopName}. All rights reserved.
                </div>
            </footer>
        </>
    )
}