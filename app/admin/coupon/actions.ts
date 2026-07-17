// app/admin/coupon/actions.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { revalidatePath } from "next/cache";

export type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  min_cart_value: number;
  max_discount_amount: number | null;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  times_used: number;
  active: boolean;
  created_at: string;
};

type CouponPayload = {
  code: string;
  discount_percent: number;
  min_cart_value: number;
  max_discount_amount: number | null;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  active: boolean;
};

export async function getCoupons(): Promise<Coupon[]> {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Coupon[];
}

export async function saveCoupon(
  payload: CouponPayload,
  editId: string | null,
) {
  await requireAdmin();

  const { error } = editId
    ? await supabaseAdmin.from("coupons").update(payload).eq("id", editId)
    : await supabaseAdmin.from("coupons").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupon");
}

export async function toggleCouponActive(id: string, active: boolean) {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("coupons")
    .update({ active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupon");
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupon");
}
