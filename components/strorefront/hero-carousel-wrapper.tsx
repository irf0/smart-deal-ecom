import { createClient } from "@/lib/supabase/server";
import HeroCarousel from "./hero-carousel";

export default async function HeroCarouselWrapper() {
  const supabase = await createClient();
  const { data: slides } = await supabase
    .from("carousel_slides")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (!slides || slides.length === 0) return null;

  return <HeroCarousel slides={slides} />;
}
