"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  addProductImage,
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
} from "../../../../lib/api";
import { uploadImageToCloudinary } from "../../../../lib/cloudinary";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("M");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
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
        if (!current) throw new Error("Produto não encontrado.");

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

        const firstVariant = variantData[0] ?? null;
        setVariant(firstVariant);
        if (firstVariant) {
          setColor(firstVariant.color);
          setSize(firstVariant.size);
          setSku(firstVariant.sku);
          setPrice((firstVariant.priceInCents / 100).toFixed(2).replace(".", ","));
          setStock(String(firstVariant.stock));
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar o produto.");
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  function generateSlug(value: string) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
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
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
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
      setError(err instanceof Error ? err.message : "Não foi possível adicionar as fotos.");
    } finally {
      setAddingImages(false);
      event.target.value = "";
    }
  }

  async function handleDeleteImage(image: ProductImage) {
    if (!window.confirm("Remover esta foto do produto?")) return;
    try {
      await deleteProductImage(id, image.id);
      setImages((current) => current.filter((item) => item.id !== image.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível remover a foto.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      let imageUrl = product?.imageUrl ?? undefined;
      if (imageFile) imageUrl = await uploadImageToCloudinary(imageFile);

      await updateProduct(id, {
        categoryId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        imageUrl,
        active: true,
      });

      if (variant) {
        const priceInCents = Math.round(Number(price.replace(",", ".")) * 100);
        const stockQuantity = Number(stock);

        if (!Number.isFinite(priceInCents) || priceInCents <= 0) {
          throw new Error("Informe um preço válido.");
        }
        if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
          throw new Error("Informe um estoque válido.");
        }

        await updateProductVariant(variant.id, {
          sku: sku.trim(),
          size,
          color: color.trim(),
          priceInCents,
          stock: stockQuantity,
        });
      }

      router.push("/admin/produtos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center"><p className="text-neutral-500">Carregando produto...</p></main>;
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <Link href="/admin/produtos" className="text-sm text-neutral-500 hover:text-neutral-900">← Produtos</Link>
          <h1 className="mt-2 text-2xl font-semibold">Editar produto</h1>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Fotos do produto</h2>
            <p className="mt-1 text-sm text-neutral-500">Adicione várias fotos. A primeira imagem antiga continua como capa.</p>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {images.map((image) => (
                <div key={image.id} className="relative overflow-hidden rounded-xl border bg-neutral-50">
                  <img src={image.imageUrl} alt={name} className="aspect-[4/5] w-full object-cover" />
                  <button type="button" onClick={() => handleDeleteImage(image)} className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-red-700 shadow">
                    Remover
                  </button>
                </div>
              ))}
            </div>
            <label className="mt-5 flex cursor-pointer items-center justify-center rounded-lg border px-5 py-3 text-sm font-medium hover:bg-neutral-50">
              {addingImages ? "Enviando..." : "Adicionar fotos"}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleAddImages} disabled={addingImages} className="hidden" />
            </label>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Imagem de capa</h2>
            {imagePreview ? (
              <img src={imagePreview} alt={name} className="mt-5 h-72 w-full rounded-xl border object-contain bg-neutral-50" />
            ) : (
              <div className="mt-5 flex h-72 items-center justify-center rounded-xl border-2 border-dashed text-sm text-neutral-400">Sem imagem</div>
            )}
            <label className="mt-4 flex cursor-pointer items-center justify-center rounded-lg border px-5 py-3 text-sm font-medium hover:bg-neutral-50">
              Trocar imagem
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Informações</h2>
            <div className="mt-5 grid gap-5">
              <input value={name} onChange={(e) => { setName(e.target.value); setSlug(generateSlug(e.target.value)); }} required className="w-full rounded-lg border px-4 py-3" placeholder="Nome" />
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full rounded-lg border px-4 py-3" placeholder="Slug" />
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full rounded-lg border bg-white px-4 py-3">
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full resize-none rounded-lg border px-4 py-3" placeholder="Descrição" />
            </div>
          </div>

          {variant && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Preço, estoque e variante</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <input value={sku} onChange={(e) => setSku(e.target.value)} required className="w-full rounded-lg border px-4 py-3" placeholder="SKU" />
                <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full rounded-lg border bg-white px-4 py-3">
                  {["PP","P","M","G","GG"].map((item) => <option key={item}>{item}</option>)}
                </select>
                <input value={color} onChange={(e) => setColor(e.target.value)} required className="w-full rounded-lg border px-4 py-3" placeholder="Cor" />
                <input value={price} onChange={(e) => setPrice(e.target.value)} required inputMode="decimal" className="w-full rounded-lg border px-4 py-3" placeholder="129,90" />
                <input value={stock} onChange={(e) => setStock(e.target.value)} required type="number" min="0" className="w-full rounded-lg border px-4 py-3" placeholder="10" />
              </div>
            </div>
          )}

          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex justify-end gap-3">
            <Link href="/admin/produtos" className="rounded-lg border bg-white px-5 py-3 text-sm font-medium">Cancelar</Link>
            <button disabled={saving} type="submit" className="rounded-lg bg-neutral-950 px-6 py-3 text-sm font-medium text-white disabled:opacity-60">
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
