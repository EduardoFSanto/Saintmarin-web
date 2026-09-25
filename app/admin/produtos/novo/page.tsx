"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  createProduct,
  createProductVariant,
  getCategories,
  getCurrentUser,
  type Category,
} from "../../../../lib/api";

import { uploadImageToCloudinary } from "../../../../lib/cloudinary";

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] =
    useState("");
  const [categoryId, setCategoryId] =
    useState("");

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [sku, setSku] = useState("");
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
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

        setCategories(
          data.filter(
            (category) => category.active,
          ),
        );

        setLoading(false);
      } catch {
        setError(
          "Não foi possível carregar as categorias.",
        );

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

  function handleNameChange(
    value: string,
  ) {
    setName(value);
    setSlug(generateSlug(value));
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "A imagem deve ser JPG, PNG ou WEBP.",
      );

      event.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "A imagem deve ter no máximo 5 MB.",
      );

      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      if (!categoryId) {
        throw new Error(
          "Selecione uma categoria.",
        );
      }

      if (!imageFile) {
        throw new Error(
          "Selecione uma imagem para o produto.",
        );
      }

      if (!color.trim()) {
        throw new Error(
          "Informe a cor da variante.",
        );
      }

      if (!sku.trim()) {
        throw new Error(
          "Informe o SKU da variante.",
        );
      }

      const priceInCents =
        Math.round(
          Number(
            price.replace(",", "."),
          ) * 100,
        );

      const stockQuantity =
        Number(stock);

      if (
        !Number.isFinite(
          priceInCents,
        ) ||
        priceInCents <= 0
      ) {
        throw new Error(
          "Informe um preço válido.",
        );
      }

      if (
        !Number.isInteger(
          stockQuantity,
        ) ||
        stockQuantity < 0
      ) {
        throw new Error(
          "Informe um estoque válido.",
        );
      }

      const imageUrl =
        await uploadImageToCloudinary(
          imageFile,
        );

      const product =
        await createProduct({
          categoryId,
          name: name.trim(),
          slug: slug.trim(),
          description:
            description.trim() ||
            undefined,
          imageUrl,
          active: true,
        });

      await createProductVariant({
        productId: product.id,
        sku: sku.trim(),
        size,
        color: color.trim(),
        priceInCents,
        stock: stockQuantity,
        weightInGrams: 500,
        lengthInCentimeters: 30,
        heightInCentimeters: 5,
        widthInCentimeters: 25,
        active: true,
      });

      router.push(
        "/admin/produtos",
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">
          Carregando...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <Link
            href="/admin/produtos"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Produtos
          </Link>

          <h1 className="mt-2 text-2xl font-semibold">
            Novo produto
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Imagem do produto
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              JPG, PNG ou WEBP. Máximo de 5 MB.
            </p>

            <div className="mt-6">
              {imagePreview ? (
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                  <img
                    src={imagePreview}
                    alt="Preview do produto"
                    className="h-80 w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-80 items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50">
                  <p className="text-sm text-neutral-400">
                    Nenhuma imagem selecionada
                  </p>
                </div>
              )}

              <label className="mt-4 flex cursor-pointer items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50">
                {imageFile
                  ? "Trocar imagem"
                  : "Selecionar imagem"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imageFile && (
                <p className="mt-2 text-center text-xs text-neutral-500">
                  {imageFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Informações do produto
            </h2>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nome
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value,
                    )
                  }
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="Camiseta Básica Preta"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Slug
                </label>

                <input
                  value={slug}
                  onChange={(event) =>
                    setSlug(
                      event.target.value,
                    )
                  }
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="camiseta-basica-preta"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Categoria
                </label>

                <select
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(
                      event.target.value,
                    )
                  }
                  required
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
                >
                  <option value="">
                    Selecione uma categoria
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ),
                  )}
                </select>

                {categories.length === 0 && (
                  <p className="mt-2 text-sm text-neutral-500">
                    Nenhuma categoria ativa cadastrada.{" "}
                    <Link
                      href="/admin/categorias"
                      className="font-medium text-neutral-900 underline"
                    >
                      Criar categoria
                    </Link>
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Descrição
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="Descrição do produto..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Primeira variante
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Depois poderemos adicionar outras cores e tamanhos.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  SKU
                </label>

                <input
                  value={sku}
                  onChange={(event) =>
                    setSku(
                      event.target.value,
                    )
                  }
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="CAM-PRE-M"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tamanho
                </label>

                <select
                  value={size}
                  onChange={(event) =>
                    setSize(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
                >
                  <option value="PP">
                    PP
                  </option>

                  <option value="P">
                    P
                  </option>

                  <option value="M">
                    M
                  </option>

                  <option value="G">
                    G
                  </option>

                  <option value="GG">
                    GG
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Cor
                </label>

                <input
                  value={color}
                  onChange={(event) =>
                    setColor(
                      event.target.value,
                    )
                  }
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="Preto"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Preço
                </label>

                <input
                  value={price}
                  onChange={(event) =>
                    setPrice(
                      event.target.value,
                    )
                  }
                  required
                  inputMode="decimal"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="129,90"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Estoque
                </label>

                <input
                  value={stock}
                  onChange={(event) =>
                    setStock(
                      event.target.value,
                    )
                  }
                  required
                  type="number"
                  min="0"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/produtos"
              className="rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-neutral-950 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Salvando..."
                : "Criar produto"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}