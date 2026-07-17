"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
}

export async function getAllBrandsAdmin() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateBrand(
  id: string,
  updates: {
    name?: string;
    is_active?: boolean;
    is_featured?: boolean;
    sort_order?: number;
    background_color?: string;
    text_color?: string;
    border_color?: string;
  },
) {
  await assertAdmin();
  const { error } = await supabaseAdmin
    .from("brands")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
}

export async function uploadBrandLogo(id: string, formData: FormData) {
  await assertAdmin();
  const file = formData.get("logo") as File;
  if (!file) throw new Error("No file provided");

  const fileName = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("brand-logos")
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabaseAdmin.storage
    .from("brand-logos")
    .getPublicUrl(fileName);

  const { error } = await supabaseAdmin
    .from("brands")
    .update({ logo_url: publicUrl.publicUrl, logo_path: fileName })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
}

export async function createBrand(name: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin
    .from("brands")
    .insert({ name, sort_order: 100 });

  if (error) throw error;
  revalidatePath("/admin/brands");
}

export async function deleteBrand(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("brands").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
}

export async function removeBrandLogo(id: string) {
  await assertAdmin();

  const { data: brand } = await supabaseAdmin
    .from("brands")
    .select("logo_path")
    .eq("id", id)
    .single();

  if (brand?.logo_path) {
    await supabaseAdmin.storage.from("brand-logos").remove([brand.logo_path]);
  }

  const { error } = await supabaseAdmin
    .from("brands")
    .update({ logo_url: null, logo_path: null })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
}
