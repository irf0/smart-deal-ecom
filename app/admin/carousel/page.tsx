import { supabaseAdmin } from "@/lib/supabase/admin";
import CarouselForm from "@/components/admin/carousel-form";

export default async function CarouselAdminPage() {
  const { data: slides } = await supabaseAdmin
    .from("carousel_slides")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto px-4 pb-12">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Homepage Carousel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the slides shown at the top of your storefront.
        </p>
      </div>
      <CarouselForm slides={slides ?? []} />
    </div>
  );
}
