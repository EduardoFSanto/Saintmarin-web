"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { useCart } from "@/modules/cart/cart-context";

function formatPrice(priceInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceInCents / 100);
}

export default function CartPage() {
  const {
    items,
    totalItems,
    totalInCents,
    updateQuantity,
    removeItem,
  } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] px-5 py-16 md:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-black/45 transition-colors hover:text-black"
          >
            <ArrowLeft size={14} strokeWidth={1.3} />
            Continuar comprando
          </Link>

          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
            <p className="text-[9px] uppercase tracking-[0.45em] text-black/40">
              Saint Marin
            </p>

            <h1 className="mt-5 font-serif text-4xl tracking-wide md:text-5xl">
              Seu carrinho está vazio.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-black/45">
              Explore nossa coleção e encontre peças
              feitas para acompanhar seu estilo.
            </p>

            <Link
              href="/produtos"
              className="mt-9 inline-flex border border-black bg-transparent px-8 py-4 text-[9px] uppercase tracking-[0.35em] text-black transition-all duration-300 hover:bg-black hover:text-white"
            >
              Explorar coleção
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-12 md:px-8 md:py-16 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        {/* CABEÇALHO */}
        <div className="border-b border-black/10 pb-7">
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-black/45 transition-colors hover:text-black"
          >
            <ArrowLeft size={14} strokeWidth={1.3} />
            Continuar comprando
          </Link>

          <div className="mt-8">
            <p className="text-[9px] uppercase tracking-[0.4em] text-black/40">
              Saint Marin
            </p>

            <div className="mt-4 flex items-end justify-between gap-5">
              <h1 className="font-serif text-4xl tracking-wide md:text-5xl">
                Carrinho
              </h1>

              <span className="pb-1 text-[9px] uppercase tracking-[0.25em] text-black/40">
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "itens"}
              </span>
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_380px] lg:gap-20">
          {/* PRODUTOS */}
          <section>
            <div className="border-b border-black/10 pb-4">
              <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
                Seus produtos
              </p>
            </div>

            <div>
              {items.map((item) => (
                <article
                  key={item.variantId}
                  className="flex gap-5 border-b border-black/10 py-7 first:pt-6 md:gap-7"
                >
                  {/* IMAGEM */}
                  <Link
                    href={`/produtos/${item.slug}`}
                    className="flex h-36 w-28 shrink-0 items-center justify-center overflow-hidden bg-[#ece9e3] md:h-44 md:w-36"
                  >
                    <span className="text-[7px] uppercase tracking-[0.35em] text-black/20">
                      Saint Marin
                    </span>
                  </Link>

                  {/* INFORMAÇÕES */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/produtos/${item.slug}`}
                          className="text-sm tracking-wide transition-opacity hover:opacity-50"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-black/40">
                          {item.color} ·{" "}
                          {item.size}
                        </p>
                      </div>

                      <p className="shrink-0 text-[11px]">
                        {formatPrice(
                          item.priceInCents *
                            item.quantity,
                        )}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-5 pt-7">
                      {/* QUANTIDADE */}
                      <div className="flex items-center border border-black/15">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              item.quantity - 1,
                            )
                          }
                          aria-label={`Diminuir quantidade de ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-black hover:text-white"
                        >
                          <Minus
                            size={13}
                            strokeWidth={1.3}
                          />
                        </button>

                        <span className="flex h-9 min-w-9 items-center justify-center border-x border-black/10 px-2 text-[10px]">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              item.quantity + 1,
                            )
                          }
                          aria-label={`Aumentar quantidade de ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-black hover:text-white"
                        >
                          <Plus
                            size={13}
                            strokeWidth={1.3}
                          />
                        </button>
                      </div>

                      {/* REMOVER */}
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.variantId,
                          )
                        }
                        className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-black/40 transition-colors hover:text-black"
                      >
                        <Trash2
                          size={13}
                          strokeWidth={1.3}
                        />
                        Remover
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* RESUMO */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="border border-black/10 p-7 md:p-8">
              <p className="text-[9px] uppercase tracking-[0.35em] text-black/40">
                Resumo do pedido
              </p>

              {/* PRODUTOS */}
              <div className="mt-7 flex items-center justify-between text-[11px]">
                <span className="text-black/55">
                  Produtos ({totalItems})
                </span>

                <span>
                  {formatPrice(
                    totalInCents,
                  )}
                </span>
              </div>

              {/* FRETE */}
              <div className="mt-4 flex items-center justify-between text-[11px]">
                <span className="text-black/55">
                  Frete
                </span>

                <span className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Calculado no checkout
                </span>
              </div>

              {/* TOTAL */}
              <div className="mt-6 flex items-end justify-between border-t border-black/10 pt-6">
                <span className="text-[9px] uppercase tracking-[0.3em]">
                  Total
                </span>

                <span className="text-base">
                  {formatPrice(
                    totalInCents,
                  )}
                </span>
              </div>

              {/* BOTÃO */}
              <Link
                href="/checkout"
                className="mt-8 flex w-full items-center justify-center border border-black bg-transparent px-8 py-4 text-[9px] uppercase tracking-[0.35em] text-black transition-all duration-300 hover:bg-black hover:text-white"
              >
                Finalizar pedido
              </Link>

              {/* MENSAGEM */}
              <p className="mt-4 text-center text-[9px] leading-5 tracking-wide text-black/40">
                Você será direcionado para o
                checkout seguro para concluir
                seu pagamento.
              </p>

              {/* SEGURANÇA */}
              <div className="mt-7 border-t border-black/10 pt-6">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck
                    size={15}
                    strokeWidth={1.3}
                    className="text-black/45"
                  />

                  <p className="text-[8px] uppercase tracking-[0.25em] text-black/45">
                    Pagamento seguro
                  </p>
                </div>

                <p className="mt-2 text-center text-[8px] leading-5 text-black/35">
                  Seus dados são protegidos durante
                  o processo de pagamento.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}