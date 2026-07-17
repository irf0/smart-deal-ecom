import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import SellRequestStatus from "@/components/admin/sell-request-status";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between py-2 border-b last:border-0 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default async function SellRequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: r, error } = await supabaseAdmin
    .from("sell_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !r) notFound();

  const storageLabel = r.storage_gb
    ? r.storage_gb >= 1024
      ? `${r.storage_gb / 1024}TB`
      : `${r.storage_gb}GB`
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/admin/sell-requests"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Sell Requests
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {r.brand} {r.model}
          </h1>
          <p className="text-gray-500 text-sm capitalize">
            {r.device_type} · Submitted {fmtDate(r.created_at)}
          </p>
        </div>
        <SellRequestStatus id={r.id} status={r.status} />
      </div>

      {/* Photos */}
      {r.image_urls?.length > 0 && (
        <div className="bg-white border rounded-lg p-5 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Photos</h2>
          <div className="flex flex-wrap gap-3">
            {r.image_urls.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  className="w-28 h-28 object-cover rounded-lg border"
                  alt={`Photo ${i + 1}`}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Customer */}
        <div className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-gray-700 mb-2">Customer</h2>
          <Row label="Name" value={r.customer_name} />
          <Row
            label="WhatsApp"
            value={
              <a
                href={`https://wa.me/${r.customer_whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline"
              >
                {r.customer_whatsapp}
              </a>
            }
          />
        </div>

        {/* Device */}
        <div className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-gray-700 mb-2">Device</h2>
          <Row
            label="Type"
            value={<span className="capitalize">{r.device_type}</span>}
          />
          <Row label="Brand" value={r.brand} />
          <Row label="Model" value={r.model} />
          <Row label="Year of Purchase" value={r.year_of_purchase} />
          <Row label="Storage" value={storageLabel} />
          <Row label="RAM" value={r.ram_gb ? `${r.ram_gb}GB` : null} />
          <Row label="Processor" value={r.processor} />
        </div>

        {/* Condition */}
        <div className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-gray-700 mb-2">Condition</h2>
          <Row label="Screen" value={r.screen_condition?.replace(/_/g, " ")} />
          <Row
            label="Body/Panel"
            value={r.body_condition?.replace(/_/g, " ")}
          />
          <Row
            label="Battery Health"
            value={
              r.battery_health_percent ? `${r.battery_health_percent}%` : null
            }
          />
          <Row
            label="Original Accessories"
            value={r.has_accessories ? "Yes" : "No"}
          />
          <Row label="Original Box" value={r.has_original_box ? "Yes" : "No"} />
        </div>

        {/* Pricing */}
        <div className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-gray-700 mb-2">Pricing</h2>
          <Row
            label="Expected Price"
            value={
              r.expected_price
                ? `₹${Number(r.expected_price).toLocaleString("en-IN")}`
                : "Not specified"
            }
          />
        </div>
      </div>

      {/* Functional issues */}
      {r.functional_issues?.length > 0 && (
        <div className="bg-white border rounded-lg p-5 mt-4">
          <h2 className="font-semibold text-gray-700 mb-2">
            Reported Functional Issues
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {r.functional_issues.map((issue: string, i: number) => (
              <li key={i} className="capitalize">
                {issue.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {r.notes && (
        <div className="bg-white border rounded-lg p-5 mt-4">
          <h2 className="font-semibold text-gray-700 mb-2">Notes</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.notes}</p>
        </div>
      )}
    </div>
  );
}
