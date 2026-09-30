"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  addProductImage,
  createProductVariant,
  deleteProductImage,
  getCategories,
  getCurrentUser,
  getProductImages,
  getProductVariants,
  getProducts,
  updateProduct,
  updateProductVariant,
  type Category,
  type Product,
  type ProductImage,
  type ProductVariant,
} from "../../../../../lib/api";
import { uploadImageToCloudinary } from "../../../../../lib/cloudinary";

type VariantDraft = {
  id?: string;
  sku: string;
  size: string;
  color: string;
  price: string;
  stock: string;
};

const sizes = ["PP", "P", "M", "G", "GG"];

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [addingImages, setAddingImages] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

        const products = await getProducts();
        const current = products.find((item) => item.id === id);

        if (!current) {
          throw new Error("Produto não encontrado.");
        }

        const [categoryData, variantData, imageData] = await Promise.all([
          getCategories(),
          getProductVariants(id),
          getProductImages(id),
        ]);

        setProduct(current);
        setCategories(categoryData.filter((item) => item.active));
        setImages(imageData);
        setName(current.name);
        setSlug(current.slug);
        setDescription(current.description ?? "");
        setCategoryId(current.categoryId);
        setImagePreview(current.imageUrl);

        setVariants(
          variantData.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            price: (variant.priceInCents / 100)
              .toFixed(2)
              .replace(".", ","),
            stock: String(variant.stock),
          })),
        );

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o produto.",
        );
        setLoading(false);
      }
    }

    void load();
  }, [id, router]);

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
      {
        sku: "",
        size: "M",
        color: "",
        price: "",
        stock: "0",
      },
    ]);
  }

  async function removeVariant(index: number) {
    const variant = variants[index];

    if (!variant) return;

    if (
      variant.id &&
      !window.confirm(
        "Remover esta variação? Ela deixará de existir para novas compras.",
      )
    ) {
      return;
    }

    try {
      if (variant.id) {
        const response = await fetch(
          `/api/products/variants/${variant.id}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Não foi possível remover a variação.");
        }
      }

      setVariants((current) =>
        current.filter((_, variantIndex) => variantIndex !== index),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível remover a variação.",
      );
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      setError("A imagem deve ser JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleAddImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) return;

    setAddingImages(true);
    setError("");

    try {
      for (const file of files) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(file.type)
        ) {
          throw new Error("Use apenas JPG, PNG ou WEBP.");
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Cada imagem deve ter no máximo 5 MB.");
        }

        const url = await uploadImageToCloudinary(file);
        const image = await addProductImage(id, url);

        setImages((current) => [...current, image]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível adicionar as fotos.",
      );
    } finally {
      setAddingImages(false);
      event.target.value = "";
    }
  }

  async function handleDeleteImage(image: ProductImage) {
    if (!window.confirm("Remover esta foto do produto?")) return;

    try {
      await deleteProductImage(id, image.id);
      setImages((current) =>
        current.filter((item) => item.id !== image.id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível remover a foto.",
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!product) {
        throw new Error("Produto não encontrado.");
      }

      if (variants.length === 0) {
        throw new Error("O produto precisa ter pelo menos uma variação.");
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

      let imageUrl = product.imageUrl ?? undefined;

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      await updateProduct(id, {
        categoryId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        imageUrl,
        active: true,
      });

      await Promise.all(
        preparedVariants.map((variant) =>
          variant.id
            ? updateProductVariant(variant.id, {
                sku: variant.sku,
                size: variant.size,
                color: variant.color,
                priceInCents: variant.priceInCents,
                stock: variant.stock,
              })
            : createProductVariant({
                productId: id,
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
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Carregando produto...</p>
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
            Editar produto
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gerencie fotos, tamanhos, cores, preços e estoque neste mesmo anúncio.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Fotos do produto</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Adicione várias fotos para o mesmo anúncio.
            </p>

            <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative w-40 shrink-0 overflow-hidden rounded-xl border bg-neutral-50"
                >
                  <img
                    src={image.imageUrl}
                    alt={name}
                    className="aspect-[4/5] w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image)}
                    className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-red-700 shadow"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <label className="mt-5 flex cursor-pointer items-center justify-center rounded-lg border px-5 py-3 text-sm font-medium hover:bg-neutral-50">
              {addingImages ? "Enviando..." : "Adicionar fotos"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleAddImages}
                disabled={addingImages}
                className="hidden"
              />
            </label>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Imagem de capa</h2>

            {imagePreview ? (
              <img
                src={imagePreview}
                alt={name}
                className="mt-5 h-72 w-full rounded-xl border object-contain bg-neutral-50"
              />
            ) : (
              <div className="mt-5 flex h-72 items-center justify-center rounded-xl border-2 border-dashed text-sm text-neutral-400">
                Sem imagem
              </div>
            )}

            <label className="mt-4 flex cursor-pointer items-center justify-center rounded-lg border px-5 py-3 text-sm font-medium hover:bg-neutral-50">
              Trocar imagem
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Informações</h2>

            <div className="mt-5 grid gap-5">
              <input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSlug(generateSlug(event.target.value));
                }}
                required
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Nome"
              />

              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                required
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Slug"
              />

              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
                className="w-full rounded-lg border bg-white px-4 py-3"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border px-4 py-3"
                placeholder="Descrição"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Variações</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  O mesmo produto pode ter P, M, G, GG e várias cores.
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
                  key={variant.id ?? `new-${index}`}
                  className="rounded-xl border border-neutral-200 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Variação {index + 1}
                    </p>

                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => void removeVariant(index)}
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
                        className="w-full rounded-lg border bg-white px-4 py-3"
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
                        className="w-full rounded-lg border px-4 py-3"
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
                        className="w-full rounded-lg border px-4 py-3"
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
                        className="w-full rounded-lg border px-4 py-3"
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
                        className="w-full rounded-lg border px-4 py-3"
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
              className="rounded-lg border bg-white px-5 py-3 text-sm font-medium"
            >
              Cancelar
            </Link>
            <button
              disabled={saving}
              type="submit"
              className="rounded-lg bg-neutral-950 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
