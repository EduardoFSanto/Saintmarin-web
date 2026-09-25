import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getProductVariants,
  getProducts,
} from "@/lib/api";

import { ProductPurchase } from "@/components/product-purchase";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const products = await getProducts();

  const product = products.find(
    (item) => item.slug === slug,
  );

  if (!product || !product.active) {
    notFound();
  }

  const variants =
    await getProductVariants(product.id);

  const availableVariants =
    variants.filter(
      (variant) =>
        variant.active &&
        variant.stock > 0,
    );

  if (availableVariants.length === 0) {
    notFound();
  }

  const lowestPrice = Math.min(
    ...availableVariants.map(
      (variant) =>
        variant.priceInCents,
    ),
  );

  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <div className="mx-auto max-w-[1600px] px-5 py-8 md:px-8 md:py-12 lg:px-12">
        <Link
          href="/produtos"
          className="text-[9px] uppercase tracking-[0.3em] text-black/45 transition-colors hover:text-black"
        >
          ← Voltar para produtos
        </Link>

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Imagem */}
          <div className="relative aspect-[4/5] overflow-hidden bg-[#ece9e3]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-[9px] uppercase tracking-[0.5em] text-black/20">
                  Saint Marin
                </span>
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="flex flex-col justify-center">
            <p className="text-[9px] uppercase tracking-[0.45em] text-black/40">
              {product.category?.name ??
                "Saint Marin"}
            </p>

            <h1 className="mt-4 font-serif text-4xl tracking-wide md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 text-sm leading-7 text-black/55">
              {product.description}
            </p>

            <div className="mt-8">
              <p className="text-lg">
                {new Intl.NumberFormat(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  },
                ).format(
                  lowestPrice / 100,
                )}
              </p>
            </div>

            <ProductPurchase
              product={product}
              variants={availableVariants}
            />
          </div>
        </div>
      </div>
    </main>
  );
}