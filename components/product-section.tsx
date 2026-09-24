import {
  getProductVariants,
  getProducts,
} from "@/lib/api";

import { ProductCard } from "./product-card";
import { SectionHeading } from "./section-heading";

export async function ProductSection() {
  const products = await getProducts();

  const productsWithVariants =
    await Promise.all(
      products.map(async (product) => {
        const variants =
          await getProductVariants(
            product.id,
          );

        const activeVariants =
          variants.filter(
            (variant) =>
              variant.active &&
              variant.stock > 0,
          );

        const lowestPrice =
          activeVariants.length > 0
            ? Math.min(
                ...activeVariants.map(
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
    <section
      id="masculino"
      className="mx-auto max-w-[1800px] px-5 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <SectionHeading
        title="Masculina"
        href="/produtos"
        linkLabel="Ver coleção"
      />

      {availableProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/20">
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
    </section>
  );
}