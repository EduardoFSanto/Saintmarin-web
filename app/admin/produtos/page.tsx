"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentUser,
  getProducts,
  type Product,
} from "../../../lib/api";

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      const user =
        await getCurrentUser();

      if (!user || user.role !== "admin") {
        router.replace("/admin/login");
        return;
      }

      const data =
        await getProducts();

      setProducts(data);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">
          Carregando produtos...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin"
              className="text-sm text-neutral-500 hover:text-neutral-900"
            >
              ← Painel
            </Link>

            <h1 className="mt-2 text-2xl font-semibold">
              Produtos
            </h1>
          </div>

          <button
            type="button"
            className="rounded-lg bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Novo produto
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {products.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">
              Nenhum produto cadastrado
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Comece cadastrando o primeiro produto da Saint Marin.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="divide-y">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-6 p-6"
                >
                  <div>
                    <h2 className="font-semibold">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                      {product.category?.name ??
                        "Sem categoria"}
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      /{product.slug}
                    </p>
                  </div>

                  <span
                    className={
                      product.active
                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                        : "rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500"
                    }
                  >
                    {product.active
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}