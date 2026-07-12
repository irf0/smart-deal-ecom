import type { Metadata } from "next";
import Navbar from "@/components/strorefront/navbar";
import Footer from "@/components/strorefront/footer";
import AuthModal from "@/components/strorefront/auth-modal";

export const metadata: Metadata = {
  title: "Smart Deal",
  description:
    "Buy certified second hand phones, laptops, tablets and accessories at the best prices.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink">
      <Navbar />

      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal />
    </div>
  );
}
