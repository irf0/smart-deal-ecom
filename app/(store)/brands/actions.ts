"use server";

import { createClient } from "@/lib/supabase/server";

export type Brand = {
  id: string;
  name: string;
  logo_url: string | null;
  background_color: string;
  text_color: string;
  border_color: string;
};

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, logo_url, background_color, text_color, border_color")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }

  return data;
}
