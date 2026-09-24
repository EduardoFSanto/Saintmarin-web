"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import type {
  Product,
  ProductVariant,
} from "@/lib/api";

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  color: string;
  size: string;
  priceInCents: number;
  quantity: number;
};

type AddToCartInput = {
  product: Product;
  variant: ProductVariant;
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalInCents: number;
  addItem: (input: AddToCartInput) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (
    variantId: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
};

const CartContext =
  createContext<CartContextValue | null>(
    null,
  );

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>(
    [],
  );

  function addItem({
    product,
    variant,
    quantity = 1,
  }: AddToCartInput) {
    setItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (item) =>
            item.variantId === variant.id,
        );

      if (existingItem) {
        return currentItems.map((item) =>
          item.variantId === variant.id
            ? {
                ...item,
                quantity:
                  item.quantity +
                  quantity,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          slug: product.slug,
          color: variant.color,
          size: variant.size,
          priceInCents:
            variant.priceInCents,
          quantity,
        },
      ];
    });
  }

  function removeItem(variantId: string) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.variantId !== variantId,
      ),
    );
  }

  function updateQuantity(
    variantId: string,
    quantity: number,
  ) {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.variantId === variantId
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity,
        0,
      ),
    [items],
  );

  const totalInCents = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          item.priceInCents *
            item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalInCents,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      totalItems,
      totalInCents,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider",
    );
  }

  return context;
}