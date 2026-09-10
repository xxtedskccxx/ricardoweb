import { ProductCard } from "./ProductCard";
import type { ProductRow } from "@/server/queries";

export function ProductGrid({ products }: { products: ProductRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
