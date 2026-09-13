import { ProductCard } from "./ProductCard";
import type { ProductRow } from "@/server/queries";
import { Reveal } from "@/components/motion/Reveal";

export function ProductGrid({ products, priorityCount = 0 }: { products: ProductRow[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {products.map((product, index) => (
        <Reveal key={product.id} delay={Math.min(index * 0.05, 0.2)}>
          <ProductCard product={product} priority={index < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}
