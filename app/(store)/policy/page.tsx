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
] as const;

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type PolicyBlockType = "intro" | "table" | "icons";

interface PolicyBlockBase {
  idx: number;
  id: string;
  section_slug: string;
  section_title: string;
  section_subtitle: string | null;
  position: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface PolicyIntroContent {
  text: string;
}

interface PolicyTableContent {
  columns: string[];
  rows: string[][];
}

interface PolicyIconsContent {
  items: string[];
}

interface PolicyIntroBlock extends PolicyBlockBase {
  block_type: "intro";
  content: PolicyIntroContent;
}

interface PolicyTableBlock extends PolicyBlockBase {
  block_type: "table";
  content: PolicyTableContent;
}

interface PolicyIconsBlock extends PolicyBlockBase {
  block_type: "icons";
  content: PolicyIconsContent;
}

type PolicyBlock = PolicyIntroBlock | PolicyTableBlock | PolicyIconsBlock;

/* -------------------------------------------------------------------------- */

export default async function PolicyPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("policy_blocks")
    .select("*")
    .eq("is_published", true)
    .order("position");

  const blocks = data as PolicyBlock[] | null;

  const sections = new Map<string, PolicyBlock[]>();

  blocks?.forEach((block) => {
    if (!sections.has(block.section_slug)) {
      sections.set(block.section_slug, []);
    }
    sections.get(block.section_slug)!.push(block);
  });

  const orderedSlugs = [
    ...SECTION_ORDER.filter((slug) => sections.has(slug)),
    ...Array.from(sections.keys()).filter(
      (slug) => !SECTION_ORDER.includes(slug as (typeof SECTION_ORDER)[number]),
    ),
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
              Policies &amp; Grading Guide
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

function Block({ block }: { block: PolicyBlock }) {
  switch (block.block_type) {
    case "intro":
      return (
        <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 text-sm text-[#2B2620] leading-relaxed">
          {block.content.text}
        </div>
      );

    case "table":
      return (
        <div className="bg-white border border-[#E5DDD0] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FBF7F1]">
                  {block.content.columns.map((column) => (
                    <th
                      key={column}
                      className="text-left font-medium text-[#2B2620] p-3 border-b border-[#E5DDD0] whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {block.content.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 ? "bg-[#FBF7F1]/40" : ""}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
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

    case "icons":
      return (
        <div className="flex gap-3 flex-wrap">
          {block.content.items.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#C15F3C] bg-[#C15F3C]/10 border border-[#C15F3C]/20 rounded-full px-4 py-2"
            >
              <ShieldIcon />
              {label}
            </span>
          ))}
        </div>
      );

    default:
      return null;
  }
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
