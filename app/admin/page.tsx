"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentUser,
  logout,
  type AuthUser,
} from "../../lib/api";

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadUser() {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      router.replace("/admin/login");
      return;
    }

    if (currentUser.role !== "admin") {
      router.replace("/");
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">
          Carregando painel...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              Saint Marin
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              Painel administrativo
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">
              {user?.name}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Link
            href="/admin/produtos"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-neutral-500">
              Catálogo
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Produtos
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Cadastrar e gerenciar produtos e variantes.
            </p>
          </Link>

          <Link
            href="/admin/categorias"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-neutral-500">
              Catálogo
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Categorias
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Criar e organizar as categorias dos produtos.
            </p>
          </Link>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-neutral-500">
              Operação
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Estoque
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Controle de estoque e movimentações.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-neutral-500">
              Vendas
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Pedidos
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Acompanhar pedidos e pagamentos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}