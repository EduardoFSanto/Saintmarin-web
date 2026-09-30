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

type VariantDraft = {
  sku: string;
  size: string;
  color: string;
  price: string;
  stock: string;
};

const sizes = ["PP", "P", "M", "G", "GG"];

function createEmptyVariant(): VariantDraft {
  return {
    sku: "",
    size: "M",
    color: "",
    price: "",
    stock: "",
  };
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantDraft[]>([
    createEmptyVariant(),
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();

        if (!user || user.role !== "admin") {
          router.replace("/admin/login");
          return;
        }

        const data = await getCategories();
        setCategories(data.filter((category) => category.active));
      } catch {
        setError("Não foi possível carregar as categorias.");
      } finally {
        setLoading(false);
      }
    }

    void load();
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

  function updateVariant(
    index: number,
    field: keyof VariantDraft,
    value: string,
  ) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? { ...variant, [field]: value }
          : variant,
      ),
    );
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      createEmptyVariant(),
    ]);
  }

  function removeVariant(index: number) {
    if (variants.length === 1) return;

    setVariants((current) =>
      current.filter((_, variantIndex) => variantIndex !== index),
    );
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type,
      )
    ) {
      setError("A imagem deve ser JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!categoryId) {
        throw new Error("Selecione uma categoria.");
      }

      if (!imageFile) {
        throw new Error("Selecione uma imagem para o produto.");
      }

      if (!name.trim() || !slug.trim()) {
        throw new Error("Informe nome e slug do produto.");
      }

      if (variants.length === 0) {
        throw new Error("Adicione pelo menos uma variação.");
      }

      const preparedVariants = variants.map((variant, index) => {
        const priceInCents = Math.round(
          Number(variant.price.replace(",", ".")) * 100,
        );
        const stock = Number(variant.stock);

        if (!variant.sku.trim()) {
          throw new Error(`Informe o SKU da variação ${index + 1}.`);
        }

        if (!variant.color.trim()) {
          throw new Error(`Informe a cor da variação ${index + 1}.`);
        }

        if (!Number.isFinite(priceInCents) || priceInCents <= 0) {
          throw new Error(`Informe um preço válido na variação ${index + 1}.`);
        }

        if (!Number.isInteger(stock) || stock < 0) {
          throw new Error(`Informe um estoque válido na variação ${index + 1}.`);
        }

        return {
          ...variant,
          priceInCents,
          stock,
          sku: variant.sku.trim(),
          color: variant.color.trim(),
        };
      });

      const combinations = preparedVariants.map(
        (variant) => `${variant.color.toLowerCase()}|${variant.size}`,
      );

      if (new Set(combinations).size !== combinations.length) {
        throw new Error(
          "Não é permitido repetir a mesma combinação de cor e tamanho.",
        );
      }

      const imageUrl = await uploadImageToCloudinary(imageFile);

      const product = await createProduct({
        categoryId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        imageUrl,
        active: true,
      });

      await Promise.all(
        preparedVariants.map((variant) =>
          createProductVariant({
            productId: product.id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            priceInCents: variant.priceInCents,
            stock: variant.stock,
            weightInGrams: 500,
            lengthInCentimeters: 30,
            heightInCentimeters: 5,
            widthInCentimeters: 25,
            active: true,
          }),
        ),
      );

      router.push("/admin/produtos");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link
            href="/admin/produtos"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Produtos
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">
            Novo produto
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Um produto pode ter vários tamanhos e cores no mesmo anúncio.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Foto de capa</h2>
            <p className="mt-1 text-sm text-neutral-500">
              JPG, PNG ou WEBP. Máximo de 5 MB.
            </p>

            <div className="mt-6">
              {imagePreview ? (
                <div className="overflow-hidden rounded-xl border bg-neutral-100">
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
                {imageFile ? "Trocar imagem" : "Selecionar imagem"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Informações do produto</h2>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nome
                </label>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setSlug(generateSlug(event.target.value));
                  }}
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
                  onChange={(event) => setSlug(event.target.value)}
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
                  onChange={(event) => setCategoryId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="Descrição do produto..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Variações</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Cadastre os tamanhos e cores disponíveis neste mesmo produto.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="shrink-0 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                + Adicionar variação
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-neutral-200 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Variação {index + 1}
                    </p>

                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-xs font-medium">
                        Tamanho
                      </label>
                      <select
                        value={variant.size}
                        onChange={(event) =>
                          updateVariant(index, "size", event.target.value)
                        }
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
                      >
                        {sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium">
                        Cor
                      </label>
                      <input
                        value={variant.color}
                        onChange={(event) =>
                          updateVariant(index, "color", event.target.value)
                        }
                        required
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                        placeholder="Preto"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium">
                        SKU
                      </label>
                      <input
                        value={variant.sku}
                        onChange={(event) =>
                          updateVariant(index, "sku", event.target.value)
                        }
                        required
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                        placeholder="CAM-PRE-M"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium">
                        Preço
                      </label>
                      <input
                        value={variant.price}
                        onChange={(event) =>
                          updateVariant(index, "price", event.target.value)
                        }
                        required
                        inputMode="decimal"
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                        placeholder="129,90"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium">
                        Estoque
                      </label>
                      <input
                        value={variant.stock}
                        onChange={(event) =>
                          updateVariant(index, "stock", event.target.value)
                        }
                        required
                        type="number"
                        min="0"
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
              className="rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-medium"
            >
              Cancelar
            </Link>
            <button
              disabled={saving}
              type="submit"
              className="rounded-lg bg-neutral-950 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Criando produto..." : "Criar produto"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
