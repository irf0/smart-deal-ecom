"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import {
  updateBrand,
  uploadBrandLogo,
  createBrand,
  deleteBrand,
  removeBrandLogo,
} from "../../app/admin/brandlogos/actions";

type Brand = {
  id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  background_color: string;
  text_color: string;
  border_color: string;
};

export function BrandEditor({ initialBrands }: { initialBrands: Brand[] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  function patchLocal(id: string, patch: Partial<Brand>) {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  }

  function saveField(id: string, patch: Partial<Brand>) {
    patchLocal(id, patch);
    startTransition(() => {
      updateBrand(id, patch);
    });
  }

  function removeLogo(id: string) {
    patchLocal(id, { logo_url: null });
    startTransition(() => {
      removeBrandLogo(id);
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New brand name"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <button
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          disabled={!newName.trim() || isPending}
          onClick={() =>
            startTransition(async () => {
              await createBrand(newName.trim());
              setNewName("");
              location.reload();
            })
          }
        >
          Add brand
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {brands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
            onSave={saveField}
            onRemoveLogo={() => removeLogo(brand.id)}
            onDelete={() =>
              startTransition(async () => {
                await deleteBrand(brand.id);
                setBrands((prev) => prev.filter((b) => b.id !== brand.id));
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

function BrandCard({
  brand,
  onSave,
  onDelete,
  onRemoveLogo,
}: {
  brand: Brand;
  onSave: (id: string, patch: Partial<Brand>) => void;
  onDelete: () => void;
  onRemoveLogo: () => void;
}) {
  const [name, setName] = useState(brand.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          Preview
        </p>
        <div
          className="flex h-24 w-40 items-center justify-center rounded-2xl border text-lg font-semibold shadow-sm"
          style={{
            backgroundColor: brand.background_color,
            borderColor: brand.border_color,
            color: brand.text_color,
          }}
        >
          {brand.logo_url ? (
            <Image
              src={brand.logo_url}
              alt={brand.name}
              width={110}
              height={44}
              unoptimized
              className="max-h-11 w-auto object-contain"
            />
          ) : (
            brand.name
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Name + logo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name !== brand.name && onSave(brand.id, { name })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Logo
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 transition-colors hover:border-orange-400 hover:text-orange-600"
              >
                {brand.logo_url ? "Replace" : "Upload"}
              </button>
              {brand.logo_url && (
                <button
                  onClick={() =>
                    startTransition(() => removeBrandLogo(brand.id))
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-400 transition-colors hover:border-red-300 hover:text-red-600"
                  title="Remove logo, show text instead"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("logo", file);
                startTransition(() => uploadBrandLogo(brand.id, fd));
              }}
            />
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500">
            Card colors
          </label>
          <div className="flex gap-4">
            {(
              [
                ["background_color", "Background"],
                ["text_color", "Text"],
                ["border_color", "Border"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex flex-col items-center gap-1.5">
                <input
                  type="color"
                  value={brand[key]}
                  onChange={(e) => onSave(brand.id, { [key]: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded-md border border-gray-300 p-0"
                />
                <span className="text-[11px] text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visibility + order */}
        {/* Visibility + position */}
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <Toggle
            label="Active"
            hint="visible on the storefront"
            checked={brand.is_active}
            onChange={(v) => onSave(brand.id, { is_active: v })}
          />
          <Toggle
            label="Featured"
            hint="shown in the homepage carousel"
            checked={brand.is_featured}
            onChange={(v) => onSave(brand.id, { is_featured: v })}
          />
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-sm text-gray-700">Position</span>
              <span className="ml-1 text-xs text-gray-400">
                (lower number shows first)
              </span>
            </div>
            <input
              type="number"
              defaultValue={brand.sort_order}
              onBlur={(e) =>
                onSave(brand.id, { sort_order: Number(e.target.value) })
              }
              className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Delete */}
        <div className="flex justify-end border-t border-gray-100 pt-3">
          {confirmDelete ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">Delete {brand.name}?</span>
              <button
                onClick={onDelete}
                className="font-medium text-red-600 hover:text-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-sm text-gray-400 transition-colors hover:text-red-600"
            >
              Delete brand
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        <span className="ml-1 text-xs text-gray-400">({hint})</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-orange-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
