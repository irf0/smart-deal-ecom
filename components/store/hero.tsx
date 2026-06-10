import Link from 'next/link'

export default function Hero() {
    return (
        <section className="bg-[#0F172A] text-white py-16 md:py-24">
            <div className="max-w-6xl mx-auto px-4">
                <div className="max-w-2xl">
                    <span className="inline-block bg-[#2563EB]/20 text-[#2563EB] text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                        Certified Second Hand Gadgets
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                        Premium Gadgets.{' '}
                        <span className="text-[#2563EB]">Honest Prices.</span>
                    </h1>
                    <p className="text-white/60 text-lg mb-8 leading-relaxed">
                        Every device is tested, verified and ready to use. Shop phones, laptops, tablets and accessories at unbeatable prices.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            href="#products"
                            className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            Shop Now
                        </Link>
                        <a
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_SHOP_WHATSAPP}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            Chat with Us
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}