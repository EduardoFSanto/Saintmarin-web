"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentUser,
  getOrderById,
  getOrders,
  type AuthUser,
  type Order,
  type OrderSummary,
} from "@/lib/api";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = { pending: "Pendente", paid: "Pago", cancelled: "Cancelado", shipped: "Enviado", delivered: "Entregue" };
  return labels[status] ?? status;
}

function whatsappUrl(order: Order) {
  const items = order.items.map((item) =>
    "• " + item.productName + " — " + item.color + " / " + item.size + " — " + item.quantity + "x — " + formatPrice(item.totalInCents),
  ).join("\n");

  const address = [
    order.shippingStreet + ", " + order.shippingNumber,
    order.shippingComplement,
    order.shippingNeighborhood,
    order.shippingCity + " - " + order.shippingState,
    "CEP " + order.shippingCep,
  ].filter(Boolean).join("\n");

  const message = [
    "NOVO PEDIDO — SAINT MARIN",
    "",
    "Pedido: #" + order.id.slice(0, 8).toUpperCase(),
    "Data: " + formatDate(order.createdAt),
    "",
    "CLIENTE",
    "Nome: " + order.customer.name,
    "E-mail: " + order.customer.email,
    order.customer.phone ? "Telefone: " + order.customer.phone : null,
    "",
    "PRODUTOS",
    items,
    "",
    "ENTREGA",
    address,
    "",
    "Subtotal: " + formatPrice(order.subtotalInCents),
    "Frete: " + formatPrice(order.shippingInCents),
    "TOTAL: " + formatPrice(order.totalInCents),
    "",
    "Status: " + statusLabel(order.status),
  ].filter(Boolean).join("\n");

  return "https://wa.me/5511999575756?text=" + encodeURIComponent(message);
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "admin") {
          router.replace("/admin/login");
          return;
        }
        setUser(currentUser);
        setOrders(await getOrders());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar os pedidos.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function openOrder(id: string) {
    try {
      setSelectedOrder(await getOrderById(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o pedido.");
    }
  }

  const pendingCount = useMemo(() => orders.filter((order) => order.status === "pending").length, [orders]);
  const paidCount = useMemo(() => orders.filter((order) => order.status === "paid").length, [orders]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-neutral-100"><p className="text-neutral-500">Carregando pedidos...</p></main>;

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div><p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Saint Marin</p><h1 className="mt-1 text-2xl font-semibold">Pedidos</h1></div>
          <div className="flex items-center gap-4"><span className="hidden text-sm text-neutral-600 md:block">{user?.name}</span><Link href="/admin" className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">Voltar</Link></div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-neutral-500">Total de pedidos</p><p className="mt-2 text-3xl font-semibold">{orders.length}</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-neutral-500">Pendentes</p><p className="mt-2 text-3xl font-semibold">{pendingCount}</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-neutral-500">Pagos</p><p className="mt-2 text-3xl font-semibold">{paidCount}</p></div>
        </div>
        {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          {orders.length === 0 ? <div className="p-10 text-center text-sm text-neutral-500">Nenhum pedido recebido ainda.</div> : <div className="divide-y">
            {orders.map((order) => <button key={order.id} type="button" onClick={() => openOrder(order.id)} className="grid w-full gap-4 px-6 py-5 text-left transition hover:bg-neutral-50 md:grid-cols-[1fr_2fr_1fr_1fr_1fr]">
              <div><p className="text-xs text-neutral-400">Pedido</p><p className="mt-1 font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p></div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-400">Produtos</p>
                <div className="mt-2 flex min-w-0 items-center gap-3">
                  {order.items[0]?.imageUrl ? (
                    <img
                      src={order.items[0].imageUrl}
                      alt={order.items[0].productName}
                      className="h-12 w-10 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-10 shrink-0 rounded bg-neutral-100" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {order.items[0]?.productName ?? "Produto não identificado"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {order.items.length > 1
                        ? `+ ${order.items.length - 1} outro(s)`
                        : order.items[0]
                          ? `${order.items[0].color} · ${order.items[0].size} · ${order.items[0].quantity}x`
                          : "Sem itens"}
                    </p>
                  </div>
                </div>
              </div>
              <div><p className="text-xs text-neutral-400">Total</p><p className="mt-1 font-medium">{formatPrice(order.totalInCents)}</p></div>
              <div><p className="text-xs text-neutral-400">Status</p><p className="mt-1 font-medium">{statusLabel(order.status)}</p></div>
              <div><p className="text-xs text-neutral-400">Data</p><p className="mt-1 text-sm">{formatDate(order.createdAt)}</p></div>
            </button>)}
          </div>}
        </div>
      </section>

      {selectedOrder && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 md:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl">
          <div className="flex items-start justify-between border-b px-6 py-5"><div><p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Pedido</p><h2 className="mt-1 text-2xl font-semibold">#{selectedOrder.id.slice(0, 8).toUpperCase()}</h2></div><button type="button" onClick={() => setSelectedOrder(null)} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">Fechar</button></div>
          <div className="space-y-7 p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Cliente</p><p className="mt-2 font-medium">{selectedOrder.customer.name}</p><p className="mt-1 text-sm text-neutral-600">{selectedOrder.customer.email}</p>{selectedOrder.customer.phone && <p className="mt-1 text-sm text-neutral-600">{selectedOrder.customer.phone}</p>}</div>
              <div><p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Status</p><p className="mt-2 font-medium">{statusLabel(selectedOrder.status)}</p><p className="mt-1 text-sm text-neutral-500">{formatDate(selectedOrder.createdAt)}</p></div>
            </div>
            <div><p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Entrega</p><p className="mt-2 text-sm leading-6">{selectedOrder.shippingStreet}, {selectedOrder.shippingNumber}{selectedOrder.shippingComplement ? " — " + selectedOrder.shippingComplement : ""}<br />{selectedOrder.shippingNeighborhood}<br />{selectedOrder.shippingCity} - {selectedOrder.shippingState}<br />CEP {selectedOrder.shippingCep}</p></div>
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                  Produtos do pedido
                </p>
                <p className="text-xs text-neutral-400">
                  {selectedOrder.items.length} {selectedOrder.items.length === 1 ? "item" : "itens"}
                </p>
              </div>

              <div className="mt-3 divide-y overflow-hidden rounded-xl border bg-white">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex gap-4 px-4 py-4 md:px-5">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[8px] uppercase tracking-wider text-neutral-400">
                          Sem foto
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-neutral-950">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        SKU: {item.sku}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-neutral-100 px-3 py-1">
                          Cor: {item.color}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-3 py-1">
                          Tamanho: {item.size}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-3 py-1">
                          Quantidade: {item.quantity}
                        </span>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold">
                      {formatPrice(item.totalInCents)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-5"><div className="flex justify-between text-sm"><span className="text-neutral-500">Subtotal</span><span>{formatPrice(selectedOrder.subtotalInCents)}</span></div><div className="mt-2 flex justify-between text-sm"><span className="text-neutral-500">Frete</span><span>{formatPrice(selectedOrder.shippingInCents)}</span></div><div className="mt-4 flex justify-between border-t pt-4 text-lg font-semibold"><span>Total</span><span>{formatPrice(selectedOrder.totalInCents)}</span></div></div>
            <a href={whatsappUrl(selectedOrder)} target="_blank" rel="noreferrer" className="block w-full rounded-lg bg-[#25D366] px-6 py-4 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90">Enviar pedido pelo WhatsApp</a>
            <p className="text-center text-xs leading-5 text-neutral-400">O WhatsApp abrirá uma conversa com o número cadastrado e a mensagem do pedido já preenchida.</p>
          </div>
        </div>
      </div>}
    </main>
  );
}