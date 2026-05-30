import Sidebar from '@/components/admin/sidebar'
import { Toaster } from 'sonner'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
                {children}
            </main>
            <Toaster richColors position="top-right" duration={1000} closeButton />
        </div>
    )
}