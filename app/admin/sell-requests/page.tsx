export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase/admin";
import SellRequestStatus from "@/components/admin/sell-request-status";
import RefreshButton from "@/components/admin/refresh-button";

export default async function SellRequestsPage() {
  const { data: requests } = await supabaseAdmin
    .from("sell_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">Sell Requests</h1>

        <div className="flex items-center gap-3">
          <RefreshButton />
          {requests && (
            <span className="text-xs font-medium bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
              {requests.length} total
            </span>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Device
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Type
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Customer
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Condition
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Expected Price
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Photos
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests?.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {r.brand} {r.model}
                  </p>
                  {r.storage_gb && (
                    <p className="text-xs text-gray-400">
                      {r.storage_gb >= 1024
                        ? `${r.storage_gb / 1024}TB`
                        : `${r.storage_gb}GB`}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 text-gray-600 capitalize">
                  {r.device_type}
                </td>

                <td className="px-4 py-3">
                  <p>{r.customer_name}</p>
                  <p className="text-xs text-gray-400 font-mono">
                    {r.customer_whatsapp}
                  </p>
                </td>

                <td className="px-4 py-3 text-gray-600 text-xs">
                  {r.screen_condition && (
                    <p>Screen: {r.screen_condition.replace(/_/g, " ")}</p>
                  )}
                  {r.body_condition && (
                    <p>Body: {r.body_condition.replace(/_/g, " ")}</p>
                  )}
                </td>

                <td className="px-4 py-3 font-medium">
                  {r.expected_price
                    ? `₹${Number(r.expected_price).toLocaleString("en-IN")}`
                    : "—"}
                </td>

                <td className="px-4 py-3">
                  {r.image_urls?.length > 0 ? (
                    <div className="flex gap-1">
                      {r.image_urls
                        .slice(0, 3)
                        .map((url: string, i: number) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={url}
                              className="w-8 h-8 object-cover rounded border"
                            />
                          </a>
                        ))}
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <SellRequestStatus id={r.id} status={r.status} />
                </td>

                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}

            {!requests?.length && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  No sell requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {requests?.map((r) => (
          <div key={r.id} className="bg-white border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h2 className="font-semibold">
                  {r.brand} {r.model}
                </h2>

                <p className="text-sm text-gray-500 capitalize">
                  {r.device_type}
                </p>

                {r.storage_gb && (
                  <p className="text-xs text-gray-400">
                    {r.storage_gb >= 1024
                      ? `${r.storage_gb / 1024}TB`
                      : `${r.storage_gb}GB`}
                  </p>
                )}
              </div>

              <SellRequestStatus id={r.id} status={r.status} />
            </div>

            <div>
              <p className="font-medium">{r.customer_name}</p>
              <p className="text-sm text-gray-500">{r.customer_whatsapp}</p>
            </div>

            {(r.screen_condition || r.body_condition) && (
              <div className="text-sm text-gray-600 space-y-1">
                {r.screen_condition && (
                  <p>Screen: {r.screen_condition.replace(/_/g, " ")}</p>
                )}
                {r.body_condition && (
                  <p>Body: {r.body_condition.replace(/_/g, " ")}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {r.expected_price
                  ? `₹${Number(r.expected_price).toLocaleString("en-IN")}`
                  : "—"}
              </span>

              <span className="text-xs text-gray-500">
                {new Date(r.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {r.image_urls?.length > 0 && (
              <div className="flex gap-2">
                {r.image_urls.slice(0, 3).map((url: string, i: number) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={url}
                      className="w-14 h-14 object-cover rounded border"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        {!requests?.length && (
          <div className="bg-white border rounded-lg py-10 text-center text-gray-400">
            No sell requests yet.
          </div>
        )}
      </div>
    </div>
  );
}
