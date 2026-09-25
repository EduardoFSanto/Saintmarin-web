"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  Product,
  ProductVariant,
} from "@/lib/api";

import { useCart } from "@/modules/cart/cart-context";

type ProductPurchaseProps = {
  product: Product;
  variants: ProductVariant[];
};

export function ProductPurchase({
  product,
  variants,
}: ProductPurchaseProps) {
  const { addItem, buyNow } = useCart();
  const router = useRouter();

  const colors = useMemo(
    () =>
      Array.from(
        new Set(
          variants.map(
            (variant) =>
              variant.color,
          ),
        ),
      ),
    [variants],
  );

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          variants.map(
            (variant) =>
              variant.size,
          ),
        ),
      ),
    [variants],
  );

  const [selectedColor, setSelectedColor] =
    useState(colors[0] ?? "");

  const [selectedSize, setSelectedSize] =
    useState(sizes[0] ?? "");

  const [added, setAdded] =
    useState(false);

  const selectedVariant =
    variants.find(
      (variant) =>
        variant.color ===
          selectedColor &&
        variant.size === selectedSize,
    );

  function handleBuyNow() {
    if (!selectedVariant) {
      return;
    }

    buyNow({
      product,
      variant: selectedVariant,
    });

    router.push("/checkout");
  }

  function handleAddToCart() {
    if (!selectedVariant) {
      return;
    }

    addItem({
      product,
      variant: selectedVariant,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  return (
    <div className="mt-10 border-t border-black/10 pt-8">
      {/* Cor */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-black/45">
          Cor
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                setSelectedColor(color);

                const firstAvailableSize =
                  variants.find(
                    (variant) =>
                      variant.color ===
                        color &&
                      variant.active &&
                      variant.stock > 0,
                  )?.size;

                if (
                  firstAvailableSize
                ) {
                  setSelectedSize(
                    firstAvailableSize,
                  );
                }
              }}
              className={`border px-5 py-3 text-[9px] uppercase tracking-[0.2em] transition-colors ${
                selectedColor === color
                  ? "border-black bg-black text-white"
                  : "border-black/15 hover:border-black"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Tamanho */}
      <div className="mt-8">
        <p className="text-[9px] uppercase tracking-[0.3em] text-black/45">
          Tamanho
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {sizes.map((size) => {
            const available =
              variants.some(
                (variant) =>
                  variant.size ===
                    size &&
                  variant.color ===
                    selectedColor &&
                  variant.active &&
                  variant.stock > 0,
              );

            return (
              <button
                key={size}
                type="button"
                disabled={!available}
                onClick={() =>
                  setSelectedSize(size)
                }
                className={`border px-5 py-3 text-[9px] uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-25 ${
                  selectedSize === size &&
                  available
                    ? "border-black bg-black text-white"
                    : "border-black/15 hover:border-black"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Estoque */}
      {selectedVariant && (
        <p className="mt-6 text-[9px] uppercase tracking-[0.25em] text-black/40">
          {selectedVariant.stock}{" "}
          {selectedVariant.stock === 1
            ? "unidade disponível"
            : "unidades disponíveis"}
        </p>
      )}

      {/* Ações */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={!selectedVariant}
          onClick={handleAddToCart}
          className="w-full border border-black bg-transparent px-6 py-4 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          {added
            ? "Adicionado ao carrinho"
            : "Adicionar ao carrinho"}
        </button>

        <button
          type="button"
          disabled={!selectedVariant}
          onClick={handleBuyNow}
          className="w-full bg-black px-6 py-4 text-[9px] uppercase tracking-[0.3em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Comprar agora
        </button>
      </div>
    </div>
  );
}