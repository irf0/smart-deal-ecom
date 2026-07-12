"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
import BrandDialog from "./brand-dialog";

type Brand = {
  id: string | null;
  name: string;
  logo_url: string | null;
  logo_path: string | null;
  sort_order: number;
  is_active: boolean;
  configured: boolean;
};

export default function BrandsTable({ brands }: { brands: Brand[] }) {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Logo
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold">
                Brand
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold">
                Status
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold">
                Sort
              </th>

              <th className="px-6 py-3 text-right text-sm font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {brands.map((brand) => (
              <tr
                key={brand.name}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      width={56}
                      height={56}
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-gray-100 text-xs font-medium text-gray-400">
                      —
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 font-medium">{brand.name}</td>

                <td className="px-6 py-4">
                  {brand.configured ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Configured
                    </span>
                  ) : (
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                      Needs setup
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">{brand.sort_order}</td>

                <td className="px-6 py-4 text-right">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedBrand(brand);
                      setOpen(true);
                    }}
                  >
                    {brand.configured ? "Edit" : "Setup"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BrandDialog open={open} onOpenChange={setOpen} brand={selectedBrand} />
    </>
  );
}
