"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { revalidatePath } from "next/cache";

export async function deleteProduct(id: string) {
  await requireAdmin();

  // Check for existing orders BEFORE deleting anything
  const { data: existingOrderItems, error: checkError } = await supabaseAdmin
    .from("order_items")
    .select("id")
    .eq("product_id", id)
    .limit(1);

  if (checkError) throw new Error(checkError.message);

  if (existingOrderItems && existingOrderItems.length > 0) {
    throw new Error(
      "This product has existing orders and cannot be deleted. Consider archiving it instead.",
    );
  }

  // Safe to delete — no order history references this product
  await supabaseAdmin.from("product_images").delete().eq("product_id", id);
  await supabaseAdmin.from("product_identifiers").delete().eq("product_id", id);

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
}
