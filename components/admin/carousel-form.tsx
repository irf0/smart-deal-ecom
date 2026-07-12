"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveSlide, deleteSlide } from "@/app/admin/carousel/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import Loader from "@/components/admin/loader";

type Slide = {
  id: string;
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

const GRADIENT_OPTIONS = [
  "from-[#D4532A] via-[#E8783A] to-[#E8A317]",
  "from-[#B8431F] via-[#D4532A] to-[#C45C3A]",
  "from-[#8B3A12] via-[#D4532A] to-[#E8A317]",
];

export default function CarouselForm({
  slides: initialSlides,
}: {
  slides: Slide[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [loading, setLoading] = useState<string | null>(null);

  function updateField(id: string, field: keyof Slide, value: any) {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  async function handleImageUpload(id: string, file: File) {
    setLoading(id);
    try {
      const ext = file.name.split(".").pop();
      const path = `carousel/${uuidv4()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);
      updateField(id, "image_url", publicUrl);
      toast.success("Image uploaded — remember to save this slide");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleSave(slide: Slide) {
    setLoading(slide.id);
    try {
      await saveSlide(slide);
      toast.success("Slide saved");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this slide?")) return;
    setLoading(id);
    try {
      await deleteSlide(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      toast.success("Slide deleted");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete");
    } finally {
      setLoading(null);
    }
  }

  async function handleAddNew() {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      eyebrow: "",
      title: "New slide",
      highlight: "",
      subtitle: "",
      cta_label: "",
      cta_href: "",
      image_url: null,
      gradient: GRADIENT_OPTIONS[0],
      sort_order: slides.length + 1,
      active: true,
    };
    setLoading(newSlide.id);
    try {
      const { id, ...rest } = newSlide;
      await saveSlide(rest as any);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add slide");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {slides.map((slide) => (
        <div
          key={slide.id}
          className="border rounded-lg p-4 space-y-3 bg-white"
        >
          {loading === slide.id && <Loader text="Saving..." />}

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">
              Slide #{slide.sort_order}
            </span>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={slide.active}
                onChange={(e) =>
                  updateField(slide.id, "active", e.target.checked)
                }
              />
              Active
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Eyebrow</Label>
              <Input
                value={slide.eyebrow ?? ""}
                onChange={(e) =>
                  updateField(slide.id, "eyebrow", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sort Order</Label>
              <Input
                type="number"
                value={slide.sort_order}
                onChange={(e) =>
                  updateField(
                    slide.id,
                    "sort_order",
                    parseInt(e.target.value) || 0,
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                value={slide.title}
                onChange={(e) => updateField(slide.id, "title", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Highlight</Label>
              <Input
                value={slide.highlight ?? ""}
                onChange={(e) =>
                  updateField(slide.id, "highlight", e.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Subtitle</Label>
            <Textarea
              rows={2}
              value={slide.subtitle ?? ""}
              onChange={(e) =>
                updateField(slide.id, "subtitle", e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Button Label</Label>
              <Input
                value={slide.cta_label ?? ""}
                onChange={(e) =>
                  updateField(slide.id, "cta_label", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Button Link</Label>
              <Input
                value={slide.cta_href ?? ""}
                onChange={(e) =>
                  updateField(slide.id, "cta_href", e.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Gradient</Label>
            <div className="flex gap-2">
              {GRADIENT_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateField(slide.id, "gradient", g)}
                  className={`h-8 w-16 rounded bg-gradient-to-br ${g} border-2 ${slide.gradient === g ? "border-gray-900" : "border-transparent"}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">
              Image (optional — overrides gradient background)
            </Label>
            {slide.image_url && (
              <img
                src={slide.image_url}
                className="w-32 h-16 object-cover rounded border mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(slide.id, file);
              }}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => handleSave(slide)}
              disabled={loading === slide.id}
              className="cursor-pointer"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(slide.id)}
              disabled={loading === slide.id}
              className="cursor-pointer"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={handleAddNew}
        className="cursor-pointer"
      >
        + Add New Slide
      </Button>
    </div>
  );
}
