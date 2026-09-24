const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3333";

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    active: boolean;
  } | null;
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  priceInCents: number;
  stock: number;
  active: boolean;
};

type ApiResponse<T> = {
  data: T;
};

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(
    `${API_URL}/products`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os produtos.",
    );
  }

  const result =
    (await response.json()) as ApiResponse<Product[]>;

  return result.data;
}

export async function getProductVariants(
  productId: string,
): Promise<ProductVariant[]> {
  const response = await fetch(
    `${API_URL}/products/${productId}/variants`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar as variantes do produto.",
    );
  }

  const result =
    (await response.json()) as ApiResponse<ProductVariant[]>;

  return result.data;
}