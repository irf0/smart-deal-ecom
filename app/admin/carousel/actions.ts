"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { revalidatePath } from "next/cache";

type SlideInput = {
  id?: string;
  eyebrow: string | null;
  title: string;
  highlight: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image_url: string | null;
  gradient: string;
  sort_order: number;
  active: boolean;
};

export async function saveSlide(input: SlideInput) {
  await requireAdmin();

  if (input.id) {
    const { error } = await supabaseAdmin
      .from("carousel_slides")
      .update(input)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("carousel_slides").insert(input);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/carousel");
  revalidatePath("/");
}

export async function deleteSlide(id: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("carousel_slides")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/carousel");
  revalidatePath("/");
}
