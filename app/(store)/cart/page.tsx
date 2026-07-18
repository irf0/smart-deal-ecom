"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ImageOff,
  ChevronLeft,
  Tag,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { createOrder } from "@/lib/actions/orderActions";
import { getEligibleCoupons } from "@/lib/actions/couponActions";
import { useState, useEffect, useTransition } from "react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  min_cart_value: number;
  max_discount_amount: number | null;
};

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) => state.totalPrice());
  const totalItems = useCartStore((state) => state.totalItems());
  const { name, city, whatsappNumber } = useUserStore();

  const [placing, setPlacing] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponPending, startCouponTransition] = useTransition();
  const [eligibleCoupons, setEligibleCoupons] = useState<Coupon[]>([]);
  const [showEligible, setShowEligible] = useState(false);

  // Derived discount values
  const discountAmount = appliedCoupon
    ? Math.min(
        Math.round((totalPrice * appliedCoupon.discount_percent) / 100),
        appliedCoupon.max_discount_amount ?? Infinity,
      )
    : 0;
  const finalPrice = totalPrice - discountAmount;

  // Fetch eligible coupons whenever cart total changes
  useEffect(() => {
    if (items.length === 0) return;
    getEligibleCoupons(totalPrice)
      .then(setEligibleCoupons)
      .catch(() => {});
  }, [totalPrice, items.length]);

  // Re-validate applied coupon if cart total changes
  useEffect(() => {
    if (!appliedCoupon) return;
    if (totalPrice < appliedCoupon.min_cart_value) {
      setAppliedCoupon(null);
      setCouponError(
        `Coupon removed — cart total dropped below ₹${appliedCoupon.min_cart_value.toLocaleString("en-IN")}`,
      );
    }
  }, [totalPrice]);

  function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError("");

    startCouponTransition(async () => {
      // Look up coupon in eligible list first (already fetched & validated server-side)
      const match = eligibleCoupons.find((c) => c.code === code);
      if (!match) {
        // Try fetching directly in case user typed a valid code not shown
        const all = await getEligibleCoupons(totalPrice);
        const directMatch = all.find((c) => c.code === code);
        if (!directMatch) {
          setCouponError(
            "Invalid coupon or cart doesn't meet the minimum value.",
          );
          return;
        }
        setAppliedCoupon(directMatch);
      } else {
        setAppliedCoupon(match);
      }
      setCouponError("");
    });
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  }

  function handleSelectEligible(coupon: Coupon) {
    setCouponInput(coupon.code);
    setAppliedCoupon(coupon);
    setCouponError("");
    setShowEligible(false);
  }

  function decrement(variant_id: string, quantity: number) {
    if (quantity <= 1) removeItem(variant_id);
    else updateQuantity(variant_id, quantity - 1);
  }

  async function sendOrderOnWhatsApp() {
    setPlacing(true);
    const waWindow = window.open("", "_blank");

    try {
      await createOrder({
        customerName: name,
        customerWhatsapp: whatsappNumber,
        city,
        totalPrice: finalPrice,
        items,
        couponCode: appliedCoupon?.code ?? null,
        discountAmount,
      });

      const lines = items.map((item, i) => {
        const title = `${item.brand} ${item.model} (${item.condition_label})`;
        const lineTotal = item.price * item.quantity;
        return `${i + 1}. ${title} x${item.quantity} — ₹${lineTotal.toLocaleString("en-IN")}`;
      });

      const discountLine = appliedCoupon
        ? `\nDiscount (${appliedCoupon.code}): -₹${discountAmount.toLocaleString("en-IN")}`
        : "";

      const message =
        `Hi, I'd like to place an order:\n\n` +
        `Name: ${name}\n` +
        `City: ${city}\n` +
        `WhatsApp: ${whatsappNumber}\n\n` +
        lines.join("\n") +
        discountLine +
        `\n\nTotal: ₹${finalPrice.toLocaleString("en-IN")}`;

      if (waWindow) {
        waWindow.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      } else {
        // popup was blocked despite our best effort — fall back
        window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      }
      clearCart();
    } catch (err) {
      waWindow?.close(); // clean up the blank tab if the order failed
      alert("Something went wrong placing your order. Please try again.");
      console.error(err);
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <ShoppingCart className="w-7 h-7 text-accent" />
        </div>
        <p className="text-gray-700 font-semibold text-lg">
          Your cart is empty
        </p>
        <p className="text-gray-400 text-sm mt-1 mb-5">
          Browse listings and add items to get started
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl px-5 py-2.5 transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/product"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Continue browsing
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Your Cart{" "}
              <span className="text-gray-400 font-medium text-lg">
                ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Clear cart
          </button>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3 mb-6">
          {items.map((item) => (
            <div
              key={item.variant_id}
              className="bg-white rounded-2xl border border-gray-200 p-3 flex gap-3 items-center"
            >
              <Link href={`/product/${item.slug}`} className="shrink-0">
                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={`${item.brand} ${item.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageOff className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`}>
                  <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-[#2563EB] transition-colors">
                    {item.brand} {item.model}
                  </p>
                </Link>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                  {item.condition_label}
                </span>
                <p className="text-[#2563EB] font-bold text-sm mt-1.5">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-1">
                  <button
                    onClick={() => decrement(item.variant_id, item.quantity)}
                    className="w-7 h-7 flex cursor-pointer items-center justify-center text-gray-500 hover:text-accent-hover transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-semibold text-gray-900 w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.variant_id, item.quantity + 1)
                    }
                    className="w-7 h-7 flex cursor-pointer items-center justify-center text-gray-500 hover:text-accent-hover transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.variant_id)}
                  className="text-gray-400 cursor-pointer hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Coupon Section ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-accent" />
            Have a coupon?
          </p>

          {/* Eligible coupons banner */}
          {eligibleCoupons.length > 0 && !appliedCoupon && (
            <div className="mb-3">
              <button
                onClick={() => setShowEligible((v) => !v)}
                className="w-full flex items-center justify-between text-xs font-medium text-[#2563EB] bg-blue-50 border border-blue-100 rounded-xl px-3 py-2"
              >
                <span>
                  🎉 {eligibleCoupons.length} coupon
                  {eligibleCoupons.length > 1 ? "s" : ""} available for your
                  cart
                </span>
                {showEligible ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
              {showEligible && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {eligibleCoupons.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectEligible(c)}
                      className="flex items-center justify-between text-sm bg-gray-50 border border-dashed border-gray-300 rounded-xl px-3 py-2 hover:border-[#2563EB] hover:bg-blue-50 transition-colors"
                    >
                      <span className="font-mono font-bold text-gray-800">
                        {c.code}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {c.discount_percent}% off
                        {c.max_discount_amount
                          ? ` (up to ₹${c.max_discount_amount.toLocaleString("en-IN")})`
                          : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applied coupon pill */}
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-800 font-mono">
                    {appliedCoupon.code}
                  </p>
                  <p className="text-xs text-green-600">
                    {appliedCoupon.discount_percent}% off — you save ₹
                    {discountAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-green-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setCouponError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                placeholder="Enter coupon code"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent-hover"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponPending || !couponInput.trim()}
                className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors"
              >
                {couponPending ? "Applying…" : "Apply"}
              </button>
            </div>
          )}

          {couponError && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <X className="w-3 h-3" /> {couponError}
            </p>
          )}
        </div>

        {/* ── Order Summary ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky bottom-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">
              Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
            <span className="text-sm font-semibold text-gray-800">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
          </div>

          {appliedCoupon && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 text-sm flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Discount ({appliedCoupon.code})
              </span>
              <span className="text-green-600 text-sm font-semibold">
                −₹{discountAmount.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between mb-4">
            <span className="text-gray-700 font-semibold text-sm">Total</span>
            <span className="text-xl font-bold text-gray-900">
              ₹{finalPrice.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={sendOrderOnWhatsApp}
            disabled={placing}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fbd5a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-3.5 transition-colors"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="w-5 h-5 brightness-0 invert"
            />
            {placing ? "Placing order…" : "Send Order on WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
