import { notFound } from "next/navigation";
import { fetchProductBySlug } from "@/lib/store/fetch-product-detail";
import ProductDetailClient from "@/components/strorefront/product-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return {};

  const title = `${product.brand} ${product.model}`;
  const lowestPrice = product.variants[0]?.price;

  return {
    title: `${title} | Smart Deal`,
    description:
      product.description ??
      `Buy ${title} at the best price. ${lowestPrice ? `Starting from ₹${lowestPrice.toLocaleString("en-IN")}.` : ""}`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
