import { getAllBrandsAdmin } from "./actions";
import { BrandEditor } from "../../../components/admin/brands-logo-editor";

export default async function AdminBrandsPage() {
  const brands = await getAllBrandsAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Manage Brands</h1>
      <BrandEditor initialBrands={brands} />
    </main>
  );
}
