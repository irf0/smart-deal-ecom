// app/admin/policy/policy-admin-client.tsx
"use client";
import { useState } from "react";
import {
  upsertPolicyBlock,
  deletePolicyBlock,
} from "@/app/(store)/policy/actions";

export default function PolicyAdminClient({
  initialBlocks,
}: {
  initialBlocks: any[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [editing, setEditing] = useState<any | null>(null);

  const grouped = new Map<string, any[]>();
  blocks.forEach((b) => {
    if (!grouped.has(b.section_slug)) grouped.set(b.section_slug, []);
    grouped.get(b.section_slug)!.push(b);
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#2B2620]">Policy Page</h1>
            <p className="text-sm text-[#8A8175] mt-1">
              Manage the content shown on /policy
            </p>
          </div>
          <button
            onClick={() =>
              setEditing({
                block_type: "table",
                content: { columns: [], rows: [] },
                is_published: true,
                position: 0,
              })
            }
            className="bg-[#000] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#A94F30] transition-colors cursor-pointer"
          >
            + Add block
          </button>
        </div>

        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([slug, sectionBlocks]) => (
            <div
              key={slug}
              className="bg-white border border-[#E5DDD0] rounded-xl overflow-hidden"
            >
              <div className="px-5 py-3 bg-[#FBF7F1] border-b border-[#E5DDD0]">
                <p className="text-xs uppercase tracking-wide text-[#8A8175] font-medium">
                  {slug}
                </p>
              </div>
              <div className="divide-y divide-[#E5DDD0]">
                {sectionBlocks.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#2B2620]">
                        {b.section_title}
                      </p>
                      <p className="text-xs text-[#8A8175] mt-0.5">
                        {b.block_type}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(b)}
                        className="text-xs font-medium text-[#2B2620] border border-[#E5DDD0] rounded-md px-3 py-1.5 hover:bg-[#F5F0E8] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          await deletePolicyBlock(b.id);
                          setBlocks(blocks.filter((x) => x.id !== b.id));
                        }}
                        className="text-xs font-medium text-[#C15F3C] border border-[#C15F3C]/30 rounded-md px-3 py-1.5 hover:bg-[#C15F3C]/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <BlockFormModal block={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function BlockFormModal({
  block,
  onClose,
}: {
  block: any;
  onClose: () => void;
}) {
  const [form, setForm] = useState(block);
  const [columnsText, setColumnsText] = useState(
    form.content?.columns?.join(", ") ?? "",
  );
  const [rowsText, setRowsText] = useState(
    form.content?.rows?.map((r: string[]) => r.join(", ")).join("\n") ?? "",
  );
  const [introText, setIntroText] = useState(form.content?.text ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    let content = form.content;
    if (form.block_type === "table") {
      content = {
        columns: columnsText.split(",").map((c: string) => c.trim()),
        rows: rowsText
          .split("\n")
          .filter(Boolean)
          .map((line: string) => line.split(",").map((c) => c.trim())),
      };
    } else if (form.block_type === "intro") {
      content = { text: introText };
    }
    await upsertPolicyBlock({ ...form, content });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#2B2620]">
          {block.id ? "Edit block" : "Add block"}
        </h2>

        <Field label="Section slug">
          <input
            value={form.section_slug ?? ""}
            onChange={(e) => setForm({ ...form, section_slug: e.target.value })}
            placeholder="e.g. warranty"
            className="input"
          />
        </Field>

        <Field label="Section title">
          <input
            value={form.section_title ?? ""}
            onChange={(e) =>
              setForm({ ...form, section_title: e.target.value })
            }
            className="input"
          />
        </Field>

        <Field label="Section subtitle (optional)">
          <input
            value={form.section_subtitle ?? ""}
            onChange={(e) =>
              setForm({ ...form, section_subtitle: e.target.value })
            }
            className="input"
          />
        </Field>

        <Field label="Block type">
          <select
            value={form.block_type}
            onChange={(e) => setForm({ ...form, block_type: e.target.value })}
            className="input"
          >
            <option value="table">Table</option>
            <option value="intro">Text</option>
            <option value="icons">Icon badges</option>
          </select>
        </Field>

        {form.block_type === "table" && (
          <>
            <Field label="Columns (comma-separated)">
              <input
                value={columnsText}
                onChange={(e) => setColumnsText(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Rows (one per line, cells comma-separated)">
              <textarea
                value={rowsText}
                onChange={(e) => setRowsText(e.target.value)}
                rows={6}
                className="input font-mono text-xs"
              />
            </Field>
          </>
        )}

        {form.block_type === "intro" && (
          <Field label="Text">
            <textarea
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              rows={4}
              className="input"
            />
          </Field>
        )}

        <Field label="Position">
          <input
            type="number"
            value={form.position ?? 0}
            onChange={(e) =>
              setForm({ ...form, position: Number(e.target.value) })
            }
            className="input"
          />
        </Field>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#C15F3C] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#A94F30] disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            onClick={onClose}
            className="text-sm font-medium text-[#2B2620] border border-[#E5DDD0] px-4 py-2.5 rounded-lg hover:bg-[#F5F0E8] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[#8A8175] uppercase tracking-wide">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
