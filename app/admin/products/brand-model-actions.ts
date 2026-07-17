// app/admin/products/brand-model-actions.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

export type Brand = { id: string; name: string };
export type Model = { id: string; name: string; brand_id: string };

export async function getBrands(): Promise<Brand[]> {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getModelsByBrand(brandId: string): Promise<Model[]> {
  await requireAdmin();
  if (!brandId) return [];
  const { data, error } = await supabaseAdmin
    .from("models")
    .select("id, name, brand_id")
    .eq("brand_id", brandId)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createBrand(name: string): Promise<Brand> {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Brand name is required");

  const { data, error } = await supabaseAdmin
    .from("brands")
    .insert({ name: trimmed })
    .select("id, name")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error(`"${trimmed}" already exists`);
    throw new Error(error.message);
  }
  return data;
}

export async function createModel(
  brandId: string,
  name: string,
): Promise<Model> {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Model name is required");
  if (!brandId) throw new Error("Select a brand first");

  const { data, error } = await supabaseAdmin
    .from("models")
    .insert({ brand_id: brandId, name: trimmed })
    .select("id, name, brand_id")
    .single();

  if (error) {
    if (error.code === "23505")
      throw new Error(`"${trimmed}" already exists for this brand`);
    throw new Error(error.message);
  }
  return data;
}
