const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3333";

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
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

export type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
};

export type OrderSummary = {
  id: string;
  status: string;
  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;
  shippingCep: string;
  shippingStreet: string;
  shippingNumber: string;
  shippingComplement: string | null;
  shippingNeighborhood: string;
  shippingCity: string;
  shippingState: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
};

export type Order = OrderSummary & {
  items: Array<{
    id: string;
    productVariantId: string;
    productName: string;
    sku: string;
    size: string;
    color: string;
    unitPriceInCents: number;
    quantity: number;
    totalInCents: number;
    createdAt: string;
  }>;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type ApiResponse<T> = {
  data: T;
};

export async function getOrders(): Promise<OrderSummary[]> {
  const response = await fetch(
    `${API_URL}/orders`,
    {
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível carregar os pedidos.");
  }

  const result =
    (await response.json()) as ApiResponse<OrderSummary[]>;

  return result.data;
}

export async function getOrderById(
  id: string,
): Promise<Order> {
  const response = await fetch(
    `${API_URL}/orders/${id}`,
    {
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível carregar o pedido.");
  }

  const result =
    (await response.json()) as ApiResponse<Order>;

  return result.data;
}

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

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(
    `${API_URL}/categories`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar as categorias.",
    );
  }

  const result =
    (await response.json()) as ApiResponse<Category[]>;

  return result.data;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "E-mail ou senha inválidos.",
    );
  }

  const result =
    (await response.json()) as ApiResponse<{
      user: AuthUser;
      expiresAt: string;
    }>;

  return result.data.user;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!response.ok) {
    return null;
  }

  const result =
    (await response.json()) as ApiResponse<AuthUser>;

  return result.data;
}

export async function logout(): Promise<void> {
  const response = await fetch(
    `${API_URL}/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível encerrar a sessão.",
    );
  }
}

export type CreateProductInput = {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
};

export type CreateProductVariantInput = {
  productId: string;
  sku: string;
  size: string;
  color: string;
  priceInCents: number;
  stock: number;
  weightInGrams: number;
  lengthInCentimeters: number;
  heightInCentimeters: number;
  widthInCentimeters: number;
  active?: boolean;
};

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const response = await fetch(
    `${API_URL}/products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const result =
      await response.json().catch(
        () => null,
      );

    throw new Error(
      result?.error?.message ??
        "Não foi possível criar o produto.",
    );
  }

  const result =
    (await response.json()) as ApiResponse<Product>;

  return result.data;
}

export async function createProductVariant(
  input: CreateProductVariantInput,
): Promise<ProductVariant> {
  const response = await fetch(
    `${API_URL}/products/${input.productId}/variants`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const result =
      await response.json().catch(
        () => null,
      );

    throw new Error(
      result?.error?.message ??
        "Não foi possível criar a variante.",
    );
  }

  const result =
    (await response.json()) as ApiResponse<ProductVariant>;

  return result.data;
}

export type CreateCategoryInput = {
  name: string;
  slug: string;
  active?: boolean;
};

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const response = await fetch(
    `${API_URL}/categories`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const result =
      await response.json().catch(
        () => null,
      );

    throw new Error(
      result?.error?.message ??
        "Não foi possível criar a categoria.",
    );
  }

  const result =
    (await response.json()) as ApiResponse<Category>;

  return result.data;
}
