"use server";

import type { CartItem } from "@/store/cartStore";
import { supabaseAdmin } from "@/lib/supabase/admin";

type CreateOrderInput = {
  customerName: string | null;
  customerWhatsapp: string | null;
  city: string | null;
  totalPrice: number;
  items: CartItem[];
  couponCode?: string | null;
  discountAmount?: number;
};

export async function createOrder(input: CreateOrderInput) {
  const now = new Date().toISOString();

  // Recalculate subtotal server-side from items — never trust client total
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ── Server-side coupon validation ──────────────────────────────────────────
  let validatedCouponCode: string | null = null;
  let validatedDiscount = 0;

  if (input.couponCode) {
    const code = input.couponCode.trim().toUpperCase();

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select(
        "id, code, discount_percent, min_cart_value, max_discount_amount, usage_limit, times_used, active, valid_from, valid_until",
      )
      .eq("code", code)
      .single();

    if (error || !coupon) {
      throw new Error(`Coupon "${code}" not found.`);
    }
    if (!coupon.active) {
      throw new Error(`Coupon "${code}" is no longer active.`);
    }
    if (now < coupon.valid_from || now > coupon.valid_until) {
      throw new Error(`Coupon "${code}" has expired or is not yet valid.`);
    }
    if (subtotal < coupon.min_cart_value) {
      throw new Error(
        `Coupon "${code}" requires a minimum cart value of ₹${coupon.min_cart_value.toLocaleString("en-IN")}.`,
      );
    }
    if (
      coupon.usage_limit !== null &&
      coupon.times_used >= coupon.usage_limit
    ) {
      throw new Error(`Coupon "${code}" has reached its usage limit.`);
    }

    // Recalculate discount server-side
    validatedDiscount = Math.round((subtotal * coupon.discount_percent) / 100);
    if (coupon.max_discount_amount !== null) {
      validatedDiscount = Math.min(
        validatedDiscount,
        coupon.max_discount_amount,
      );
    }
    validatedCouponCode = coupon.code;

    // Increment times_used with optimistic concurrency check
    const { error: incrementError } = await supabaseAdmin
      .from("coupons")
      .update({ times_used: coupon.times_used + 1 })
      .eq("id", coupon.id)
      .eq("times_used", coupon.times_used); // only update if unchanged

    if (incrementError) {
      throw new Error(
        `Coupon "${code}" could not be applied. Please try again.`,
      );
    }
  }

  const finalTotal = subtotal - validatedDiscount;

  // ── Insert order (your original schema, + coupon columns) ─────────────────
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: input.customerName ?? "Unknown",
      customer_whatsapp: input.customerWhatsapp ?? "",
      total_price: finalTotal,
      status: "new",
      notes: `City: ${input.city}`,
      coupon_code: validatedCouponCode,
      discount_amount: validatedDiscount,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    // Roll back times_used if order failed after incrementing
    if (validatedCouponCode) {
      await supabaseAdmin.rpc("decrement_coupon_times_used", {
        coupon_code: validatedCouponCode,
      });
    }
    throw new Error(orderError?.message ?? "Failed to create order");
  }

  // ── Insert order_items — one row per unit, matching your existing pattern ──
  const orderItemRows = input.items.flatMap((item) =>
    Array.from({ length: item.quantity }, () => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      price: item.price,
      identifier_id: null,
    })),
  );

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItemRows);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return { orderId: order.id, orderNumber: order.order_number };
}
