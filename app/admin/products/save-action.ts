"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { revalidatePath } from "next/cache";

type VariantInput = {
  id?: string;
  condition: string;
  price: number;
  original_price: number | null;
  stock_count: number;
  battery_health: number | null;
  status: string;
};

type NewImageInput = { url: string; position: number };

type SaveProductInput = {
  productId?: string;
  slug?: string;
  productData: {
    category_id: string;
    brand_id: string;
    model_id: string;
    description: string | null;
    specs: string | null;
    ram_gb: number | null;
    storage_gb: number | null;
    network_type: string | null;
    os: string | null;
    color: string | null;
  };
  variants: VariantInput[];
  newImages: NewImageInput[];
};

export async function saveProduct(input: SaveProductInput) {
  await requireAdmin();

  const { brand_id, model_id } = input.productData;
  if (!brand_id) throw new Error("Brand is required");
  if (!model_id) throw new Error("Model is required");

  // Look up brand/model names server-side — never trust client-sent text.
  // This keeps the legacy `brand`/`model` text columns (still read by the
  // storefront) automatically in sync with the selected brand/model.
  const [
    { data: brandRow, error: brandErr },
    { data: modelRow, error: modelErr },
  ] = await Promise.all([
    supabaseAdmin.from("brands").select("name").eq("id", brand_id).single(),
    supabaseAdmin.from("models").select("name").eq("id", model_id).single(),
  ]);

  if (brandErr || !brandRow) throw new Error("Selected brand not found");
  if (modelErr || !modelRow) throw new Error("Selected model not found");

  const dataToSave = {
    ...input.productData,
    brand: brandRow.name,
    model: modelRow.name,
  };

  let productId = input.productId;

  if (productId) {
    const { error } = await supabaseAdmin
      .from("products")
      .update(dataToSave)
      .eq("id", productId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({ ...dataToSave, slug: input.slug })
      .select()
      .single();
    if (error) throw new Error(error.message);
    productId = data.id;
  }

  for (const row of input.variants) {
    const variantData = { product_id: productId, ...row };
    if (row.id) {
      const { error } = await supabaseAdmin
        .from("product_variants")
        .update(variantData)
        .eq("id", row.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("product_variants")
        .insert(variantData);
      if (error) throw new Error(error.message);
    }
  }

  for (const img of input.newImages) {
    const { error } = await supabaseAdmin.from("product_images").insert({
      product_id: productId,
      url: img.url,
      position: img.position,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  return { productId };
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("product_images")
    .delete()
    .eq("id", imageId);
  if (error) throw new Error(error.message);
}
