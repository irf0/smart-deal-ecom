"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(() => {
          router.refresh();
        })
      }
      disabled={isPending}
      className="px-3 py-1.5 bg-black text-white text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {isPending ? "Refreshing..." : "Refresh"}
    </button>
  );
}
