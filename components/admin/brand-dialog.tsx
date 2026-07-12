"use client";

import { useEffect, useState, useTransition } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveBrand, uploadBrandLogo } from "@/app/admin/brands/actions";

type Brand = {
  id: string | null;
  name: string;
  logo_url: string | null;
  logo_path: string | null;
  sort_order: number;
  is_active: boolean;
  configured: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
};

export default function BrandDialog({ open, onOpenChange, brand }: Props) {
  const [sortOrder, setSortOrder] = useState(999);
  const [isActive, setIsActive] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!brand) return;

    setSortOrder(brand.sort_order);
    setIsActive(brand.is_active);
    setLogoUrl(brand.logo_url);
    setLogoPath(brand.logo_path);
  }, [brand]);

  const handleSave = async () => {
    if (!brand) return;

    try {
      const formData = new FormData();

      formData.append("name", brand.name);
      formData.append("sort_order", String(sortOrder));
      formData.append("is_active", String(isActive));

      if (logoUrl) {
        formData.append("logo_url", logoUrl);
      }

      if (logoPath) {
        formData.append("logo_path", logoPath);
      }

      await saveBrand(formData);

      onOpenChange(false);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{brand?.name}</DialogTitle>

          <DialogDescription>
            Configure how this brand appears on the storefront.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-28 w-28 items-center justify-center rounded-xl border bg-gray-50">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brand.name}
                  className="max-h-20 max-w-20 object-contain"
                />
              ) : (
                <span className="text-sm text-gray-400">No Logo</span>
              )}
            </div>

            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("file", file);

                  const result = await uploadBrandLogo(formData);

                  setLogoUrl(result.logoUrl);
                  setLogoPath(result.logoPath);
                }}
              />

              <Button asChild type="button" variant="outline">
                <span>Upload Logo</span>
              </Button>
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Sort Order</label>

            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />

            <span className="text-sm">Show on homepage</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
