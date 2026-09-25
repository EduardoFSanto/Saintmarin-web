"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  createCategory,
  getCategories,
  getCurrentUser,
  type Category,
} from "../../../lib/api";

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const user =
          await getCurrentUser();

        if (!user || user.role !== "admin") {
          router.replace("/admin/login");
          return;
        }

        const data =
          await getCategories();

        setCategories(data);
      } catch {
        setError(
          "Não foi possível carregar as categorias.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  function generateSlug(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(value: string) {
    setName(value);
    setSlug(generateSlug(value));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim();

    if (!normalizedName || !normalizedSlug) {
      setError(
        "Informe o nome e o slug da categoria.",
      );
      return;
    }

    setSaving(true);

    try {
      const category =
        await createCategory({
          name: normalizedName,
          slug: normalizedSlug,
          active: true,
        });

      setCategories((current) => [
        category,
        ...current,
      ]);

      setName("");
      setSlug("");
      setSuccess(
        "Categoria criada com sucesso.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a categoria.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">
          Carregando categorias...
        </p>
      </main>
    );
  }

  const activeCount =
    categories.filter(
      (category) => category.active,
    ).length;

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
              Categorias
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Organize o catálogo da Saint Marin.
            </p>
          </div>

          <Link
            href="/admin/produtos"
            className="rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
          >
            Ver produtos
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[360px_1fr]">
        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm text-neutral-500">
              Nova categoria
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Adicionar ao catálogo
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="category-name"
                className="mb-2 block text-sm font-medium"
              >
                Nome
              </label>

              <input
                id="category-name"
                value={name}
                onChange={(event) =>
                  handleNameChange(
                    event.target.value,
                  )
                }
                required
                maxLength={100}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                placeholder="Camisetas"
              />
            </div>

            <div>
              <label
                htmlFor="category-slug"
                className="mb-2 block text-sm font-medium"
              >
                Slug
              </label>

              <input
                id="category-slug"
                value={slug}
                onChange={(event) => {
                  setSlug(
                    generateSlug(
                      event.target.value,
                    ),
                  );
                  setError("");
                  setSuccess("");
                }}
                required
                maxLength={120}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                placeholder="camisetas"
              />

              <p className="mt-2 text-xs text-neutral-400">
                Usado na URL e gerado automaticamente pelo nome.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Salvando..."
                : "Criar categoria"}
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div>
              <h2 className="font-semibold">
                Categorias cadastradas
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                {categories.length}{" "}
                {categories.length === 1
                  ? "categoria"
                  : "categorias"}{" "}
                · {activeCount}{" "}
                {activeCount === 1
                  ? "ativa"
                  : "ativas"}
              </p>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-semibold">
                Nenhuma categoria cadastrada
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                Crie a primeira categoria para liberar o cadastro de produtos.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-6 px-6 py-5"
                >
                  <div>
                    <h3 className="font-medium">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      /{category.slug}
                    </p>
                  </div>

                  <span
                    className={
                      category.active
                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                        : "rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500"
                    }
                  >
                    {category.active
                      ? "Ativa"
                      : "Inativa"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
