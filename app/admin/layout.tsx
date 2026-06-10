import SidebarWrapper from '@/components/admin/sidebar-wrapper'
import { Toaster } from 'sonner'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <SidebarWrapper />
            <main className="flex-1 overflow-y-auto p-6 lg:pl-6 pt-14 lg:pt-6">
                {children}
            </main>
            <Toaster richColors position="top-right" duration={1000} closeButton />
        </div>
    )
}