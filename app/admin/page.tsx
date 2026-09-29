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

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        if (!active) return;

        if (!currentUser || currentUser.role !== "admin") {
          router.replace("/");
          return;
        }

        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        if (!active) return;

        setAuthError(
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao validar a sessão.",
        );
        setLoading(false);
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.assign("/admin/login");
    }
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

  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
            Erro de autenticação
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-neutral-950">
            A sessão não pôde ser validada
          </h1>

          <pre className="mt-6 overflow-auto rounded-lg bg-neutral-100 p-4 text-sm text-neutral-800 whitespace-pre-wrap">
            {authError}
          </pre>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
            >
              Tentar novamente
            </button>

            <button
              type="button"
              onClick={() => window.location.assign("/admin/login")}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
            >
              Voltar para login
            </button>
          </div>
        </div>
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
            <p className="text-sm text-neutral-500">Catálogo</p>
            <h2 className="mt-2 text-xl font-semibold">Produtos</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Cadastrar e gerenciar produtos e variantes.
            </p>
          </Link>

          <Link
            href="/admin/categorias"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-neutral-500">Catálogo</p>
            <h2 className="mt-2 text-xl font-semibold">Categorias</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Criar e organizar as categorias dos produtos.
            </p>
          </Link>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-neutral-500">Operação</p>
            <h2 className="mt-2 text-xl font-semibold">Estoque</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Controle de estoque e movimentações.
            </p>
          </div>

          <Link
            href="/admin/pedidos"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-neutral-500">Vendas</p>
            <h2 className="mt-2 text-xl font-semibold">Pedidos</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Acompanhar pedidos, clientes e pagamentos.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
