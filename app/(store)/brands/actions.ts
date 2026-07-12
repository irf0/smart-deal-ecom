"use server";

import { createClient } from "@/lib/supabase/server";

export async function getBrands() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("brand")
    .not("brand", "is", null);

  if (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }

  const brands = Array.from(
    new Set(
      data
        .map((item) => item.brand?.trim())
        .filter((brand): brand is string => Boolean(brand)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return brands;
}
