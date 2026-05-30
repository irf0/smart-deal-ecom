'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    return (
        <div className="w-56 bg-white border-r flex flex-col h-screen">
            <div className="p-5 border-b">
                <h1 className="font-bold text-lg">Smart Deal</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
            </div>

            <nav className="flex-1 p-3 space-y-1">
                {links.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href ||
                        (href !== '/admin' && pathname.startsWith(href))
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
                                    ? 'bg-black text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-3 border-t">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 w-full"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </div>
    )
}