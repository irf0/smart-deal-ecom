import { AvailableProductsCard } from "@/components/dashboard/available-product-card";
import { PendingOrdersCard } from "@/components/dashboard/pending-orders-card";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { SoldProductsCard } from "@/components/dashboard/sold-products-card";
import { TotalProductsCard } from "@/components/dashboard/total-products-card";

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