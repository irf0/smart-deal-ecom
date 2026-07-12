import { Suspense } from "react";
import ProductListing from "@/components/strorefront/product-listing";

export default function ProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductListing />
    </Suspense>
  );
}
