"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  LogOut,
  X,
  BadgeDollarSign,
  Clapperboard,
  Palette,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  {
    href: "/admin/sell-requests",
    label: "Sell Requests",
    icon: BadgeDollarSign,
  },
  { href: "/admin/coupon", label: "Coupons", icon: Tag },
  { href: "/admin/carousel", label: "Banner Settings", icon: Clapperboard },
  {
    href: "/admin/brandlogos",
    label: "Brand Logos Settings",
    icon: Palette,
  },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
                fixed top-0 left-0 h-screen w-56 bg-white border-r flex flex-col z-30
                transition-transform duration-200
                ${open ? "translate-x-0" : "-translate-x-full"}
                lg:static lg:translate-x-0 lg:z-auto
            `}
      >
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Smart Deal</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 w-full cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
