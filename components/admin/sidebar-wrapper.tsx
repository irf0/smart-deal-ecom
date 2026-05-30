'use client'

import { useState } from 'react'
import Sidebar from '@/components/admin/sidebar'
import { Menu } from 'lucide-react'

export default function SidebarWrapper() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-10 p-1.5 rounded-md bg-white border shadow-sm hover:bg-gray-100 transition-colors cursor-pointer"
            >
                <Menu size={20} />
            </button>
        </>
    )
}