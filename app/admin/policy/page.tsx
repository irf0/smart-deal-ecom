// app/admin/policy/page.tsx
import PolicyAdminClient from "@/components/admin/policy-table-editor";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function PolicyAdminPage() {
  const { data: blocks } = await supabaseAdmin
    .from("policy_blocks")
    .select("*")
    .order("section_slug")
    .order("position");

  return <PolicyAdminClient initialBlocks={blocks ?? []} />;
}
