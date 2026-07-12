import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import OrderStatusUpdater from "@/components/admin/order-status-updater";
import OrderNotes from "@/components/admin/order-notes";
import WhatsAppButton from "@/components/admin/whatsapp-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/lib/constants/order";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
            *,
            order_items (
                *,
                products ( id, brand, model, product_images ( url, position ) ),
                product_identifiers ( identifier )
            )
        `,
    )
    .eq("id", id)
    .single();

  if (error || !order) notFound();

  const items = order.order_items ?? [];

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">
              Order #{order.order_number}
            </h1>
            <Badge
              variant="outline"
              className={ORDER_STATUS_STYLES[order.status]}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
        </div>
        <WhatsAppButton
          phone={order.customer_whatsapp}
          orderNumber={order.order_number}
          customerName={order.customer_name}
        />
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left */}
        <div className="md:col-span-2 space-y-6">
          <Section title="Customer">
            <div className="rounded-lg border p-4 space-y-1">
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground font-mono">
                {order.customer_whatsapp}
              </p>
            </div>
          </Section>

          <Section title={`Items (${items.length})`}>
            <div className="rounded-lg border divide-y overflow-hidden">
              {items.map((item: any) => (
                <OrderItem key={item.id} item={item} />
              ))}
              <div className="flex justify-between items-center px-3 py-2.5 bg-gray-50">
                <span className="text-sm font-semibold">Total</span>
                <span className="font-bold">
                  ₹{order.total_price.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </Section>

          <Section title="Internal Notes">
            <OrderNotes orderId={order.id} initialNotes={order.notes ?? ""} />
          </Section>
        </div>

        {/* Right */}
        <Section title="Status">
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </section>
  );
}

function OrderItem({ item }: { item: any }) {
  const product = item.products;
  const thumbnail = product?.product_images
    ?.slice()
    ?.sort((a: any, b: any) => a.position - b.position)[0]?.url;
  const identifier = item.product_identifiers?.identifier;

  return (
    <div className="flex items-center gap-3 p-3">
      {thumbnail ? (
        <img
          src={thumbnail}
          className="w-12 h-12 object-cover rounded border shrink-0"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-gray-300 text-xs shrink-0">
          No img
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">
          {product?.brand} {product?.model}
        </p>
        {identifier && (
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            IMEI/S/N: {identifier}
          </p>
        )}
      </div>
      <p className="font-medium text-sm shrink-0">
        ₹{item.price.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
