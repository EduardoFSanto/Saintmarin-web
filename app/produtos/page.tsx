import {
  getProductVariants,
  getProducts,
} from "@/lib/api";

import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";

export default async function ProductsPage() {
  const products = await getProducts();

  const productsWithVariants =
    await Promise.all(
      products.map(async (product) => {
        const variants =
          await getProductVariants(
            product.id,
          );

        const availableVariants =
          variants.filter(
            (variant) =>
              variant.active &&
              variant.stock > 0,
          );

        const lowestPrice =
          availableVariants.length > 0
            ? Math.min(
                ...availableVariants.map(
                  (variant) =>
                    variant.priceInCents,
                ),
              )
            : null;

        return {
          ...product,
          priceInCents: lowestPrice,
        };
      }),
    );

  const availableProducts =
    productsWithVariants.filter(
      (product) =>
        product.active &&
        product.priceInCents !== null,
    );

  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <div className="mx-auto max-w-[1800px] px-5 py-12 md:px-8 md:py-16 lg:px-12">
        <SectionHeading
          title="Masculina"
          linkLabel=""
        />

        <div className="mb-10 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.25em] text-black/40">
            {availableProducts.length}{" "}
            {availableProducts.length === 1
              ? "produto"
              : "produtos"}
          </p>

          <button
            type="button"
            className="text-[9px] uppercase tracking-[0.3em] text-black/55 transition-colors hover:text-black"
          >
            Filtrar
          </button>
        </div>

        {availableProducts.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
              Nenhum produto disponível
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {availableProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={
                    product.priceInCents!
                  }
                />
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}