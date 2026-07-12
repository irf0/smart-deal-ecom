import { createClient } from "@/lib/supabase/client";
import type { StorefrontProduct } from "@/lib/types/";

export async function fetchProducts(): Promise<StorefrontProduct[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_variants")
    .select(
      `
            id,
            condition,
            price,
            original_price,
            stock_count,
            battery_health,
            products (
                id,
                brand,
                model,
                slug,
                ram_gb,
                storage_gb,
                network_type,
                os,
                color,
                categories (
                    name
                ),
                product_images (
                    url,
                    position
                )
            )
        `,
    )
    .eq("status", "available")
    .gt("stock_count", 0)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];

  return data.map((variant: any) => {
    //TODO: replace any with proper type later.
    const product = variant.products as any;
    const images: { url: string; position: number }[] =
      product.product_images ?? [];
    const firstImage =
      images.sort((a, b) => a.position - b.position)[0] ?? null;

    return {
      variant_id: variant.id,
      condition: variant.condition,
      price: variant.price,
      original_price: variant.original_price,
      stock_count: variant.stock_count,
      battery_health: variant.battery_health,
      product_id: product.id,
      brand: product.brand,
      model: product.model,
      slug: product.slug,
      ram_gb: product.ram_gb,
      storage_gb: product.storage_gb,
      network_type: product.network_type,
      os: product.os,
      color: product.color,
      category: product.categories?.name ?? "",
      image_url: firstImage?.url ?? null,
    } satisfies StorefrontProduct;
  });
}
