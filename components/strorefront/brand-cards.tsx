import Link from "next/link";
import { getBrands } from "@/app/(store)/brands/actions";

export default async function ShopByBrand() {
  const brands = await getBrands();

  if (!brands.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="mb-6 text-4xl font-bold text-gray-900">Shop by Brand</h2>

      <div
        className="
          flex
          gap-5
          overflow-x-auto
          pb-2
          snap-x
          snap-mandatory
          whitespace-nowrap
          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {brands.map((brand) => {
          const params = new URLSearchParams();
          params.append("brands", brand);
          return (
            <Link
              key={brand}
              href={`/product?${params.toString()}`}
              className="
              snap-start
              shrink-0
              flex
              h-16
              w-48
              items-center
              justify-center
              rounded-2xl
              bg-white
              border
              border-gray-200
              text-lg
              font-semibold
              shadow-sm
              transition-all
              hover:scale-[1.0]
              hover:border-orange-500
              hover:shadow-lg
            "
            >
              {brand}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
