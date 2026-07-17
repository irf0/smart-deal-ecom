// app/policy/page.tsx
import { createClient } from "@/lib/supabase/client";

export const revalidate = 0;

const SECTION_ORDER = [
  "refurbished-grades",
  "graded-products",
  "defects",
  "warranty",
  "returns",
  "contact",
];

export default async function PolicyPage() {
  const supabase = createClient();
  const { data: blocks } = await supabase
    .from("policy_blocks")
    .select("*")
    .eq("is_published", true)
    .order("position");

  const sections = new Map<string, any[]>();
  blocks?.forEach((b) => {
    if (!sections.has(b.section_slug)) sections.set(b.section_slug, []);
    sections.get(b.section_slug)!.push(b);
  });

  const orderedSlugs = [
    ...SECTION_ORDER.filter((s) => sections.has(s)),
    ...Array.from(sections.keys()).filter((s) => !SECTION_ORDER.includes(s)),
  ];

  if (orderedSlugs.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F5F0E8]">
        <p className="text-[#8A8175]">Policy content coming soon.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0E8] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-12">
        {/* Sticky sidebar nav */}
        <nav className="hidden md:block">
          <div className="sticky top-8 space-y-1">
            <p className="text-xs uppercase tracking-wide text-[#8A8175] mb-3 font-medium">
              On this page
            </p>
            {orderedSlugs.map((slug) => (
              <a
                key={slug}
                href={`#${slug}`}
                className="block text-sm text-[#2B2620] py-1.5 border-l-2 border-transparent hover:border-[#C15F3C] hover:text-[#C15F3C] pl-3 transition-colors"
              >
                {sections.get(slug)![0].section_title}
              </a>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="space-y-16">
          <header>
            <h1 className="text-3xl font-bold text-[#2B2620] tracking-tight">
              Policies & Grading Guide
            </h1>
            <p className="text-[#8A8175] mt-2">
              Everything you need to know about our grading, warranty, and
              returns.
            </p>
          </header>

          {orderedSlugs.map((slug) => {
            const sectionBlocks = sections.get(slug)!;
            return (
              <section key={slug} id={slug} className="scroll-mt-8">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-[#2B2620]">
                    {sectionBlocks[0].section_title}
                  </h2>
                  {sectionBlocks[0].section_subtitle && (
                    <p className="text-sm text-[#8A8175] mt-1">
                      {sectionBlocks[0].section_subtitle}
                    </p>
                  )}
                </div>
                <div className="space-y-5">
                  {sectionBlocks.map((block) => (
                    <Block key={block.id} block={block} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Block({ block }: { block: any }) {
  if (block.block_type === "intro") {
    return (
      <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 text-sm text-[#2B2620] leading-relaxed">
        {block.content.text}
      </div>
    );
  }

  if (block.block_type === "table") {
    return (
      <div className="bg-white border border-[#E5DDD0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FBF7F1]">
                {block.content.columns.map((c: string) => (
                  <th
                    key={c}
                    className="text-left font-medium text-[#2B2620] p-3 border-b border-[#E5DDD0] whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.content.rows.map((row: string[], i: number) => (
                <tr key={i} className={i % 2 === 1 ? "bg-[#FBF7F1]/40" : ""}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="p-3 align-top text-[#2B2620] border-b border-[#E5DDD0] last:border-b-0"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (block.block_type === "icons") {
    return (
      <div className="flex gap-3 flex-wrap">
        {block.content.items.map((label: string) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#C15F3C] bg-[#C15F3C]/10 border border-[#C15F3C]/20 rounded-full px-4 py-2"
          >
            <ShieldIcon /> {label}
          </span>
        ))}
      </div>
    );
  }

  return null;
}

function ShieldIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
    </svg>
  );
}
