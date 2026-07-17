"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type PolicyBlockInput = {
  id?: string;
  section_slug: string;
  section_title: string;
  section_subtitle: string | null;
  block_type: "intro" | "table" | "icons";
  content: any | unknown;
  position: number;
  is_published: boolean;
};

export async function upsertPolicyBlock(input: PolicyBlockInput) {
  if (!input.section_slug?.trim()) throw new Error("Section is required");
  if (!input.section_title?.trim())
    throw new Error("Section title is required");
  if (!input.block_type?.trim()) throw new Error("Block type is required");

  const { error } = await supabaseAdmin.from("policy_blocks").upsert({
    id: input.id,
    section_slug: input.section_slug.trim(),
    section_title: input.section_title.trim(),
    section_subtitle: input.section_subtitle,
    block_type: input.block_type,
    content: input.content,
    position: input.position,
    is_published: input.is_published,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/policy");
  revalidatePath("/admin/policy");
}

export async function deletePolicyBlock(id: string) {
  const { error } = await supabaseAdmin
    .from("policy_blocks")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/policy");
  revalidatePath("/admin/policy");
}
