import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import OrderTabs from "@/components/admin/order-tabs";
import OrderFilters from "@/components/admin/order-filters";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/lib/constants/order";

export type OrderStatus =
  | "new"
  | "confirmed"
  | "shipped"
  | "completed"
  | "cancelled";

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{
    status?: string;
    from?: string;
    to?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const filters = await searchParams;

  const page = Math.max(1, parseInt(filters.page ?? "1"));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Count per status for tab badges
  const { data: statusCounts } = await supabaseAdmin
    .from("orders")
    .select("status");

  const counts = (statusCounts ?? []).reduce<Record<string, number>>(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    {},
  );

  // Main query
  let query = supabaseAdmin
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to + "T23:59:59");
  if (filters.q) {
    const term = `%${filters.q}%`;
    query = query.or(
      `customer_name.ilike.${term},customer_whatsapp.ilike.${term},order_number.ilike.${term}`,
    );
  }

  const { data: orders, count, error } = await query;
  console.log("ORDERS DEBUG:", { orders, count, error });

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const activeStatus = (filters.status ?? "all") as OrderStatus | "all";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Orders</h1>
          {count !== null && (
            <span className="text-xs font-medium bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
              {count} {filters.status ? filters.status : "total"}
            </span>
          )}
        </div>
      </div>

      {/* Status tabs */}
      <OrderTabs active={activeStatus} counts={counts} />

      {/* Search + date filters */}
      <OrderFilters current={filters} />

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left font-bold px-4 py-3 text-gray-600">
                Order
              </th>
              <th className="text-left font-bold px-4 py-3 text-gray-600">
                Customer
              </th>
              <th className="text-left font-bold px-4 py-3 text-gray-600">
                WhatsApp
              </th>
              <th className="text-left font-bold px-4 py-3 text-gray-600">
                Total
              </th>
              <th className="text-left font-bold px-4 py-3 text-gray-600">
                Status
              </th>
              <th className="text-left font-bold px-4 py-3 text-gray-600">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="block">
                    <span className="font-mono font-medium text-gray-900">
                      #{order.order_number}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="block">
                    <span className="font-medium">{order.customer_name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                  {order.customer_whatsapp}
                </td>
                <td className="px-4 py-3 font-medium">
                  ₹{order.total_price.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={
                      ORDER_STATUS_STYLES[order.status as OrderStatus] ?? ""
                    }
                  >
                    {ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                      order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {!orders?.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  {filters.status || filters.q || filters.from
                    ? "No orders match your filters."
                    : "No orders yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="border-t px-4 py-3 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Page {page} of {totalPages}
            </p>
            <OrderPageNav
              page={page}
              totalPages={totalPages}
              filters={filters}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Inline pagination — simple prev/next, no extra component needed
function OrderPageNav({
  page,
  totalPages,
  filters,
}: {
  page: number;
  totalPages: number;
  filters: Record<string, string | undefined>;
}) {
  function href(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    return `/admin/orders?${params.toString()}`;
  }

  return (
    <div className="flex gap-2">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          className="px-3 py-1 rounded border text-sm hover:bg-gray-50"
        >
          ← Prev
        </Link>
      )}
      {page < totalPages && (
        <Link
          href={href(page + 1)}
          className="px-3 py-1 rounded border text-sm hover:bg-gray-50"
        >
          Next →
        </Link>
      )}
    </div>
  );
}
