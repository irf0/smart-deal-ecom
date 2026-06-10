import { AvailableProductsCard } from "@/components/admin/dashboard/available-product-card";
import { PendingOrdersCard } from "@/components/admin/dashboard/pending-orders-card";
import { RecentOrders } from "@/components/admin/dashboard/recent-orders";
import { SoldProductsCard } from "@/components/admin/dashboard/sold-products-card";
import { TotalProductsCard } from "@/components/admin/dashboard/total-products-card";

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">                <TotalProductsCard />
                <AvailableProductsCard />
                <SoldProductsCard />
                <PendingOrdersCard />
            </div>
            <RecentOrders />
        </div>
    )
}