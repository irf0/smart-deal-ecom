import Link from "next/link";
import Image from "next/image";
import { getBrands } from "./actions";

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Shop by Brand</h1>
        <p className="mt-2 text-gray-600">Browse all available brands.</p>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {brands.map((brand) => {
          const params = new URLSearchParams();
          params.append("brands", brand.name);

          return (
            <Link
              key={brand.id}
              href={`/product?${params.toString()}`}
              style={{
                backgroundColor: brand.background_color,
                borderColor: brand.border_color,
                color: brand.text_color,
              }}
              className="
                flex
                h-24
                items-center
                justify-center
                rounded-2xl
                border
                text-lg
                font-semibold
                shadow-sm
                transition-all
                hover:border-orange-500
                hover:shadow-lg
              "
            >
              {brand.logo_url ? (
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  width={120}
                  height={48}
                  unoptimized
                  className="max-h-12 w-auto object-contain"
                />
              ) : (
                brand.name
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
