import type { Metadata } from 'next'
import Navbar from '@/components/store/navbar'
import Footer from '@/components/store/footer'

export const metadata: Metadata = {
    title: 'Smart Deal — Best Second Hand Gadgets in Kerala',
    description: 'Buy certified second hand phones, laptops, tablets and accessories at the best prices.',
}

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-brand-silver">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}