"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";
import path from "path";

export type AdminBrand = {
  id: string | null;
  name: string;
  logo_url: string | null;
  logo_path: string | null;
  sort_order: number;
  is_active: boolean;
  configured: boolean;
};

export async function getBrands(): Promise<AdminBrand[]> {
  const [
    { data: products, error: productsError },
    { data: brands, error: brandsError },
  ] = await Promise.all([
    supabaseAdmin.from("products").select("brand").not("brand", "is", null),

    supabaseAdmin.from("brands").select("*"),
  ]);

  if (productsError) throw productsError;
  if (brandsError) throw brandsError;

  const discoveredMap = new Map<string, string>();

  for (const product of products ?? []) {
    const raw = product.brand?.trim();

    if (!raw) continue;

    // Normalize for comparison
    const key = raw.toLowerCase();

    // Keep the first nicely-cased version
    if (!discoveredMap.has(key)) {
      discoveredMap.set(key, raw);
    }
  }

  const discoveredBrands = Array.from(discoveredMap.values());

  const configured = new Map( //to prevent duplicates
    (brands ?? []).map((brand) => [brand.name.trim().toLowerCase(), brand]),
  );

  const merged: AdminBrand[] = discoveredBrands.map((name) => {
    const existing = configured.get(name.toLowerCase());

    return {
      id: existing?.id ?? null,
      name,
      logo_url: existing?.logo_url ?? null,
      logo_path: existing?.logo_path ?? null,
      sort_order: existing?.sort_order ?? 999,
      is_active: existing?.is_active ?? true,
      configured: !!existing,
    };
  });

  return merged.sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return a.name.localeCompare(b.name);
  });
}

export async function uploadBrandLogo(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No logo file provided.");
  }

  const extension = path.extname(file.name);
  const fileName = `${randomUUID()}${extension}`;
  const filePath = fileName;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("brand-logos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabaseAdmin.storage
    .from("brand-logos")
    .getPublicUrl(filePath);

  return {
    logoUrl: data.publicUrl,
    logoPath: filePath,
  };
}

export async function createBrand(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    throw new Error("Brand name is required.");
  }

  const sortOrder = Number(formData.get("sort_order") ?? 999);

  const { error } = await supabaseAdmin.from("brands").upsert(
    {
      name,
      sort_order: sortOrder,
      is_active: true,
    },
    {
      onConflict: "name",
    },
  );

  if (error) throw error;

  revalidatePath("/admin/brands");
}

export async function saveBrand(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    throw new Error("Brand name is required.");
  }

  const sortOrder = Number(formData.get("sort_order") ?? 999);
  const isActive = formData.get("is_active") === "true";

  const logoUrl = formData.get("logo_url");
  const logoPath = formData.get("logo_path");

  const { error } = await supabaseAdmin.from("brands").upsert(
    {
      name,
      logo_url: logoUrl || null,
      logo_path: logoPath || null,
      sort_order: sortOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "name",
    },
  );

  if (error) throw error;

  revalidatePath("/admin/brands");
  revalidatePath("/");
}

export async function deleteBrand(id: string) {
  await requireAdmin();

  const { error } = await supabaseAdmin.from("brands").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/brands");
}
