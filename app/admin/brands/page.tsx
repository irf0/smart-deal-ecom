import { getBrands } from "./actions";
import BrandsTable from "@/components/admin/brands-table";

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Brands</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Logos, display order and homepage visibility.
        </p>
      </div>

      <BrandsTable brands={brands} />
    </div>
  );
}
