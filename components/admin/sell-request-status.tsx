"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSellRequestStatus } from "@/app/admin/sell-requests/actions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Check,
  ChevronDown,
  CircleDot,
  Phone,
  BadgeIndianRupee,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const STATUSES = [
  {
    value: "new",
    label: "New",
    icon: CircleDot,
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
  {
    value: "contacted",
    label: "Contacted",
    icon: Phone,
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
  {
    value: "quoted",
    label: "Quoted",
    icon: BadgeIndianRupee,
    className:
      "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
  },
  {
    value: "closed",
    label: "Closed",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
];

export default function SellRequestStatus({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const current = STATUSES.find((s) => s.value === status) ?? STATUSES[0];

  async function update(newStatus: string) {
    if (newStatus === status) return;

    setLoading(true);

    try {
      await updateSellRequestStatus(id, newStatus);

      toast.success("Status updated");

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={loading}
          className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-all disabled:opacity-60 ${current.className}`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Icon className="h-4 w-4" />
          )}

          <span>{current.label}</span>

          <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1">
        {STATUSES.map((item) => {
          const ItemIcon = item.icon;

          return (
            <DropdownMenuItem
              key={item.value}
              onClick={() => update(item.value)}
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <ItemIcon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </div>

              {status === item.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
