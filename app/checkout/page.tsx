"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Check,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import { useCart } from "@/modules/cart/cart-context";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3333";

function formatPrice(
  priceInCents: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  ).format(
    priceInCents / 100,
  );
}

function formatCep(
  value: string,
) {
  const digits =
    value
      .replace(/\D/g, "")
      .slice(0, 8);

  if (
    digits.length <= 5
  ) {
    return digits;
  }

  return `${digits.slice(
    0,
    5,
  )}-${digits.slice(5)}`;
}

export default function CheckoutPage() {
  const {
    items,
    totalItems,
    totalInCents,
    clearCart,
  } = useCart();

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    cep,
    setCep,
  ] = useState("");

  const [
    street,
    setStreet,
  ] = useState("");

  const [
    number,
    setNumber,
  ] = useState("");

  const [
    complement,
    setComplement,
  ] = useState("");

  const [
    neighborhood,
    setNeighborhood,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    state,
    setState,
  ] = useState("");

  const [
    isLookingUpCep,
    setIsLookingUpCep,
  ] = useState(false);

  const [
    cepFound,
    setCepFound,
  ] = useState(false);

  const [
    shippingInCents,
    setShippingInCents,
  ] = useState<number | null>(
    null,
  );

  const [
    deliveryTimeInDays,
    setDeliveryTimeInDays,
  ] = useState<number | null>(
    null,
  );

  const [
    isCalculatingShipping,
    setIsCalculatingShipping,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  async function handleCepLookup() {
    const normalizedCep =
      cep.replace(
        /\D/g,
        "",
      );

    if (
      normalizedCep.length !==
      8
    ) {
      setError(
        "Digite um CEP válido com 8 números.",
      );

      return;
    }

    setError(null);
    setCepFound(false);
    setShippingInCents(null);
    setDeliveryTimeInDays(null);
    setIsLookingUpCep(true);

    try {
      const response =
        await fetch(
          `${API_URL}/shipping/cep?cep=${normalizedCep}`,
        );

      const result =
        (await response.json()) as {
          data?: {
            cep: string;
            street: string;
            neighborhood: string;
            city: string;
            state: string;
          };

          error?: {
            message?: string;
          };
        };

      if (!response.ok) {
        throw new Error(
          result.error
            ?.message ??
            "Não foi possível consultar o CEP.",
        );
      }

      if (!result.data) {
        throw new Error(
          "A API não retornou o endereço.",
        );
      }

      setStreet(
        result.data.street,
      );

      setNeighborhood(
        result.data.neighborhood,
      );

      setCity(
        result.data.city,
      );

      setState(
        result.data.state,
      );

      setCep(
        formatCep(
          result.data.cep,
        ),
      );

      setCepFound(true);
    } catch (error) {
      console.error(
        "CEP lookup error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar o CEP.",
      );
    } finally {
      setIsLookingUpCep(false);
    }
  }

  async function handleShippingQuote() {
    const normalizedCep =
      cep.replace(
        /\D/g,
        "",
      );

    if (
      normalizedCep.length !==
      8
    ) {
      setError(
        "Digite um CEP válido.",
      );

      return;
    }

    if (!cepFound) {
      setError(
        "Consulte o CEP antes de calcular o frete.",
      );

      return;
    }

    if (
      items.length === 0
    ) {
      setError(
        "Seu carrinho está vazio.",
      );

      return;
    }

    setError(null);

    setIsCalculatingShipping(
      true,
    );

    try {
      const response =
        await fetch(
          `${API_URL}/shipping/quote`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              destinationCep:
                normalizedCep,

              items: items.map(
                (item) => ({
                  productVariantId:
                    item.variantId,

                  quantity:
                    item.quantity,
                }),
              ),
            }),
          },
        );

      const result =
        (await response.json()) as {
          data?: {
            amountInCents: number;
            deliveryTimeInDays: number;
            serviceCode: string;
            provider: string;
          };

          error?: {
            message?: string;
          };
        };

      if (!response.ok) {
        throw new Error(
          result.error
            ?.message ??
            "Não foi possível calcular o frete.",
        );
      }

      if (!result.data) {
        throw new Error(
          "A API não retornou a cotação.",
        );
      }

      setShippingInCents(
        result.data.amountInCents,
      );

      setDeliveryTimeInDays(
        result.data.deliveryTimeInDays,
      );
    } catch (error) {
      console.error(
        "Shipping quote error:",
        error,
      );

      setShippingInCents(null);
      setDeliveryTimeInDays(null);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível calcular o frete.",
      );
    } finally {
      setIsCalculatingShipping(
        false,
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      items.length === 0
    ) {
      setError(
        "Seu carrinho está vazio.",
      );

      return;
    }

    const normalizedCep =
      cep.replace(
        /\D/g,
        "",
      );

    if (
      normalizedCep.length !==
      8
    ) {
      setError(
        "Digite um CEP válido.",
      );

      return;
    }

    if (!cepFound) {
      setError(
        "Consulte o CEP antes de continuar.",
      );

      return;
    }

    if (
      shippingInCents ===
      null
    ) {
      setError(
        "Calcule o frete antes de continuar.",
      );

      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      /*
       * 1. Encontrar/criar cliente
       */
      const customerResponse =
        await fetch(
          `${API_URL}/customers/find-or-create`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              email,

              ...(phone.trim()
                ? { phone }
                : {}),
            }),
          },
        );

      const customerResult =
        (await customerResponse.json()) as {
          data?: {
            id: string;
          };

          error?: {
            message?: string;
          };
        };

      if (
        !customerResponse.ok
      ) {
        throw new Error(
          customerResult.error
            ?.message ??
            "Não foi possível criar o cliente.",
        );
      }

      const customerId =
        customerResult.data?.id;

      if (!customerId) {
        throw new Error(
          "A API não retornou o ID do cliente.",
        );
      }

      /*
       * 2. Criar pedido
       *
       * IMPORTANTE:
       * Não enviamos shippingInCents.
       *
       * O backend calcula novamente.
       */
      const orderResponse =
        await fetch(
          `${API_URL}/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              customerId,

              shippingAddress: {
                cep:
                  normalizedCep,

                street,

                number,

                complement:
                  complement.trim()
                    ? complement
                    : undefined,

                neighborhood,

                city,

                state,
              },

              items:
                items.map(
                  (item) => ({
                    productVariantId:
                      item.variantId,

                    quantity:
                      item.quantity,
                  }),
                ),
            }),
          },
        );

      const orderResult =
        (await orderResponse.json()) as {
          data?: {
            id: string;
            shippingInCents?: number;
            totalInCents?: number;
          };

          error?: {
            message?: string;
          };
        };

      if (
        !orderResponse.ok
      ) {
        throw new Error(
          orderResult.error
            ?.message ??
            "Não foi possível criar o pedido.",
        );
      }

      const orderId =
        orderResult.data?.id;

      if (!orderId) {
        throw new Error(
          "A API não retornou o ID do pedido.",
        );
      }

      /*
       * 3. Criar pagamento
       */
      const paymentResponse =
        await fetch(
          `${API_URL}/orders/${orderId}/payments`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              method:
                "checkout",
            }),
          },
        );

      const paymentResult =
        (await paymentResponse.json()) as {
          data?: {
            checkoutUrl?: string;
          };

          checkoutUrl?: string;

          error?: {
            message?: string;
          };
        };

      if (
        !paymentResponse.ok
      ) {
        throw new Error(
          paymentResult.error
            ?.message ??
            "Não foi possível iniciar o pagamento.",
        );
      }

      const checkoutUrl =
        paymentResult.checkoutUrl ??
        paymentResult.data
          ?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error(
          "A API não retornou o link de pagamento.",
        );
      }

      /*
       * Só limpamos o carrinho
       * quando temos um checkout
       * válido para o pedido.
       */
      clearCart();

      window.location.href =
        checkoutUrl;
    } catch (error) {
      console.error(
        "Checkout error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao finalizar o pedido.",
      );

      setIsSubmitting(false);
    }
  }

  const totalWithShipping =
    shippingInCents === null
      ? null
      : totalInCents +
        shippingInCents;

  if (
    items.length === 0
  ) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] px-5 py-16 md:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-[900px]">
          <Link
            href="/carrinho"
            className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-black/45 transition-colors hover:text-black"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.3}
            />

            Voltar para o carrinho
          </Link>

          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
            <p className="text-[9px] uppercase tracking-[0.45em] text-black/40">
              Checkout
            </p>

            <h1 className="mt-5 font-serif text-4xl tracking-wide md:text-5xl">
              Seu carrinho está vazio.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-black/45">
              Adicione pelo menos um produto antes de continuar para o checkout.
            </p>

            <Link
              href="/produtos"
              className="mt-9 inline-flex border border-black px-8 py-4 text-[9px] uppercase tracking-[0.35em] transition-all duration-300 hover:bg-black hover:text-white"
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
        <div className="border-b border-black/10 pb-7">
          <Link
            href="/carrinho"
            className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-black/45 transition-colors hover:text-black"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.3}
            />

            Voltar para o carrinho
          </Link>

          <div className="mt-8">
            <p className="text-[9px] uppercase tracking-[0.4em] text-black/40">
              Saint Marin
            </p>

            <h1 className="mt-4 font-serif text-4xl tracking-wide md:text-5xl">
              Checkout
            </h1>
          </div>
        </div>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_380px] lg:gap-20">
          <section>
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-12"
            >
              {/* DADOS */}

              <div>
                <div className="border-b border-black/10 pb-4">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
                    01 · Seus dados
                  </p>
                </div>

                <div className="mt-7 grid gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="text-[9px] uppercase tracking-[0.3em] text-black/50"
                    >
                      Nome completo
                    </label>

                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(
                        event,
                      ) =>
                        setName(
                          event.target
                            .value,
                        )
                      }
                      required
                      minLength={
                        2
                      }
                      maxLength={
                        150
                      }
                      placeholder="Seu nome completo"
                      className="mt-3 w-full border-b border-black/15 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="email"
                        className="text-[9px] uppercase tracking-[0.3em] text-black/50"
                      >
                        E-mail
                      </label>

                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(
                          event,
                        ) =>
                          setEmail(
                            event.target
                              .value,
                          )
                        }
                        required
                        maxLength={
                          255
                        }
                        placeholder="seu@email.com"
                        className="mt-3 w-full border-b border-black/15 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="text-[9px] uppercase tracking-[0.3em] text-black/50"
                      >
                        Telefone
                        <span className="ml-2 text-black/25">
                          opcional
                        </span>
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(
                          event,
                        ) =>
                          setPhone(
                            event.target
                              .value,
                          )
                        }
                        maxLength={
                          30
                        }
                        placeholder="(24) 99999-9999"
                        className="mt-3 w-full border-b border-black/15 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ENDEREÇO */}

              <div>
                <div className="border-b border-black/10 pb-4">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
                    02 · Endereço de entrega
                  </p>
                </div>

                <div className="mt-7 grid gap-6">
                  <div>
                    <label
                      htmlFor="cep"
                      className="text-[9px] uppercase tracking-[0.3em] text-black/50"
                    >
                      CEP
                    </label>

                    <div className="mt-3 flex gap-4">
                      <input
                        id="cep"
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        value={cep}
                        onChange={(
                          event,
                        ) => {
                          setCep(
                            formatCep(
                              event.target
                                .value,
                            ),
                          );

                          setCepFound(
                            false,
                          );

                          setShippingInCents(
                            null,
                          );

                          setDeliveryTimeInDays(
                            null,
                          );
                        }}
                        required
                        placeholder="00000-000"
                        className="min-w-0 flex-1 border-b border-black/15 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
                      />

                      <button
                        type="button"
                        onClick={
                          handleCepLookup
                        }
                        disabled={
                          isLookingUpCep
                        }
                        className="inline-flex shrink-0 items-center gap-2 border border-black px-5 py-3 text-[8px] uppercase tracking-[0.25em] transition-all hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isLookingUpCep ? (
                          <Loader2
                            size={13}
                            className="animate-spin"
                          />
                        ) : (
                          <MapPin
                            size={13}
                            strokeWidth={
                              1.3
                            }
                          />
                        )}

                        Consultar
                      </button>
                    </div>

                    {cepFound && (
                      <p className="mt-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-black/45">
                        <Check
                          size={12}
                        />

                        Endereço encontrado
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="street"
                      className="text-[9px] uppercase tracking-[0.3em] text-black/50"
                    >
                      Rua
                    </label>

                    <input
                      id="street"
                      type="text"
                      autoComplete="street-address"
                      value={street}
                      onChange={(
                        event,
                      ) =>
                        setStreet(
                          event.target
                            .value,
                        )
                      }
                      required
                      maxLength={
                        200
                      }
                      placeholder="Rua / Avenida"
                      className="mt-3 w-full border-b border-black/15 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                    <div>
                      <label
                        htmlFor="number"
                        className="text-[9px] uppercase tracking-[0.3em] text-black/50"
                      >
                        Número
                      </label>

                      <input
                        id="number"
                        type="text"
                        value={number}
                        onChange={(
                          event,
                        ) =>
                          setNumber(
                            event.target
                              .value,
                          )
                        }
                        required
                        maxLength={
                          20
                        }
                        placeholder="123"
                        className="mt-3 w-full border-b border-black/15 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="complement"
                        className="text-[9px] uppercase tracking-[0.3em] text-black/50"
                      >
                        Complemento
                        <span className="ml-2 text-black/25">
                          opcional
                        </span>
                      </label>

                      <input
                        id="complement"
                        type="text"
                        value={
                          complement
                        }
                        onChange={(
                          event,
                        ) =>
                          setComplement(
                            event.target
                              .value,
                          )
                        }
                        maxLength={
                          100
                        }
                        placeholder="Apartamento, bloco..."
                        className="mt-3 w-full border-b border-black/15 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="neighborhood"
                      className="text-[9px] uppercase tracking-[0.3em] text-black/50"
                    >
                      Bairro
                    </label>

                    <input
                      id="neighborhood"
                      type="text"
                      value={
                        neighborhood
                      }
                      onChange={(
                        event,
                      ) =>
                        setNeighborhood(
                          event.target
                            .value,
                        )
                      }
                      required
                      maxLength={
                        100
                      }
                      className="mt-3 w-full border-b border-black/15 bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-black"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-[1fr_100px]">
                    <div>
                      <label
                        htmlFor="city"
                        className="text-[9px] uppercase tracking-[0.3em] text-black/50"
                      >
                        Cidade
                      </label>

                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(
                          event,
                        ) =>
                          setCity(
                            event.target
                              .value,
                          )
                        }
                        required
                        maxLength={
                          100
                        }
                        className="mt-3 w-full border-b border-black/15 bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="text-[9px] uppercase tracking-[0.3em] text-black/50"
                      >
                        UF
                      </label>

                      <input
                        id="state"
                        type="text"
                        value={state}
                        onChange={(
                          event,
                        ) =>
                          setState(
                            event.target.value
                              .toUpperCase()
                              .slice(
                                0,
                                2,
                              ),
                          )
                        }
                        required
                        maxLength={
                          2
                        }
                        className="mt-3 w-full border-b border-black/15 bg-transparent px-0 py-3 text-sm uppercase outline-none transition-colors focus:border-black"
                      />
                    </div>
                  </div>

                  {/* FRETE */}

                  <div className="border border-black/10 p-5">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-black/50">
                          Entrega
                        </p>

                        {shippingInCents !==
                        null ? (
                          <>
                            <p className="mt-2 text-sm">
                              Correios
                            </p>

                            {deliveryTimeInDays !==
                              null && (
                              <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-black/35">
                                Prazo estimado:{" "}
                                {
                                  deliveryTimeInDays
                                }{" "}
                                {
                                  deliveryTimeInDays ===
                                  1
                                    ? "dia"
                                    : "dias"
                                }
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="mt-2 text-[10px] text-black/40">
                            Consulte o frete para seu endereço.
                          </p>
                        )}
                      </div>

                      {shippingInCents !==
                      null ? (
                        <p className="text-sm">
                          {formatPrice(
                            shippingInCents,
                          )}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={
                            handleShippingQuote
                          }
                          disabled={
                            isCalculatingShipping ||
                            !cepFound
                          }
                          className="inline-flex items-center gap-2 border border-black px-5 py-3 text-[8px] uppercase tracking-[0.25em] transition-all hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isCalculatingShipping && (
                            <Loader2
                              size={13}
                              className="animate-spin"
                            />
                          )}

                          {isCalculatingShipping
                            ? "Calculando..."
                            : "Calcular frete"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PAGAMENTO */}

              <div>
                <div className="border-b border-black/10 pb-4">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
                    03 · Pagamento
                  </p>
                </div>

                {error && (
                  <div className="mt-7 border border-red-200 bg-red-50 px-5 py-4">
                    <p className="text-[10px] leading-5 text-red-700">
                      {error}
                    </p>
                  </div>
                )}

                <div className="mt-7 flex items-start gap-4 border border-black/10 p-5">
                  <ShieldCheck
                    size={18}
                    strokeWidth={1.3}
                    className="mt-0.5 shrink-0 text-black/50"
                  />

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em]">
                      Checkout seguro
                    </p>

                    <p className="mt-2 text-[10px] leading-5 text-black/40">
                      O pagamento será realizado com segurança através da InfinitePay após a confirmação dos seus dados.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    shippingInCents ===
                      null
                  }
                  className="mt-8 flex w-full items-center justify-center border border-black bg-black px-8 py-4 text-[9px] uppercase tracking-[0.35em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={14}
                        className="mr-3 animate-spin"
                        strokeWidth={
                          1.5
                        }
                      />

                      Processando pedido...
                    </>
                  ) : (
                    "Continuar para pagamento"
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* RESUMO */}

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="border border-black/10 p-7 md:p-8">
              <p className="text-[9px] uppercase tracking-[0.35em] text-black/40">
                Seu pedido
              </p>

              <div className="mt-7 divide-y divide-black/10">
                {items.map(
                  (item) => (
                    <div
                      key={
                        item.variantId
                      }
                      className="flex justify-between gap-5 py-4 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px]">
                          {
                            item.name
                          }
                        </p>

                        <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-black/40">
                          {
                            item.color
                          }{" "}
                          ·{" "}
                          {
                            item.size
                          }{" "}
                          ·{" "}
                          {
                            item.quantity
                          }
                          x
                        </p>
                      </div>

                      <p className="shrink-0 text-[10px]">
                        {formatPrice(
                          item.priceInCents *
                            item.quantity,
                        )}
                      </p>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-5 border-t border-black/10 pt-5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-black/45">
                    Subtotal
                  </span>

                  <span>
                    {formatPrice(
                      totalInCents,
                    )}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-[10px]">
                  <span className="text-black/45">
                    Frete
                  </span>

                  <span>
                    {shippingInCents ===
                    null
                      ? "A calcular"
                      : formatPrice(
                          shippingInCents,
                        )}
                  </span>
                </div>

                <div className="mt-5 border-t border-black/10 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.3em]">
                      Total
                    </span>

                    <span className="text-base">
                      {totalWithShipping ===
                      null
                        ? formatPrice(
                            totalInCents,
                          )
                        : formatPrice(
                            totalWithShipping,
                          )}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-[8px] leading-5 text-black/35">
                {totalItems}{" "}
                {totalItems ===
                1
                  ? "item"
                  : "itens"}{" "}
                no pedido
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}