"use client";

import Link from "next/link";
import {
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

import { useCart } from "@/modules/cart/cart-context";

function InstagramIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-[#f7f5f0]">
      <div className="mx-auto flex h-[74px] max-w-[1800px] items-center justify-between px-5 md:px-8 lg:px-12">
        {/* ESQUERDA */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() =>
              setMenuOpen((value) => !value)
            }
            aria-label={
              menuOpen
                ? "Fechar menu"
                : "Abrir menu"
            }
            className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-50"
          >
            {menuOpen ? (
              <X
                size={20}
                strokeWidth={1.3}
              />
            ) : (
              <Menu
                size={20}
                strokeWidth={1.3}
              />
            )}
          </button>

          <button
            type="button"
            aria-label="Buscar"
            className="ml-3 hidden items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-black/60 transition-opacity hover:opacity-50 md:flex"
          >
            <Search
              size={17}
              strokeWidth={1.3}
            />

            <span>Buscar</span>
          </button>
        </div>

        {/* LOGO */}
        <Link
          href="/"
          aria-label="Saint Marin - Página inicial"
          className="absolute left-1/2 -translate-x-1/2 text-center"
        >
          <div className="font-serif text-[20px] tracking-[0.22em] md:text-[23px]">
            SAINT MARIN
          </div>

          <div className="mt-0.5 text-[6px] uppercase tracking-[0.5em] text-black/45 md:text-[7px]">
            Premium Clothing
          </div>
        </Link>

        {/* DIREITA */}
        <div className="flex items-center">
          {/* INSTAGRAM */}
          <a
            href="https://www.instagram.com/saintmarinbr_/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Saint Marin"
            className="hidden h-10 w-10 items-center justify-center transition-opacity hover:opacity-50 md:flex"
          >
            <InstagramIcon size={18} />
          </a>

          {/* CONTA */}
          <button
            type="button"
            aria-label="Minha conta"
            className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-50"
          >
            <UserRound
              size={19}
              strokeWidth={1.3}
            />
          </button>

          {/* CARRINHO */}
          <Link
            href="/carrinho"
            aria-label={`Carrinho com ${totalItems} ${
              totalItems === 1
                ? "item"
                : "itens"
            }`}
            className="relative flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-50"
          >
            <ShoppingBag
              size={19}
              strokeWidth={1.3}
            />

            {totalItems > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[8px] font-medium text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* MENU */}
      {menuOpen && (
        <div className="border-t border-black/10 bg-[#f7f5f0]">
          <nav className="mx-auto flex max-w-[1800px] flex-col px-5 py-5 md:flex-row md:justify-center md:gap-12">
            <Link
              href="/#masculino"
              onClick={() =>
                setMenuOpen(false)
              }
              className="border-b border-black/10 py-3 text-[9px] uppercase tracking-[0.3em] md:border-0"
            >
              Masculino
            </Link>

            <Link
              href="/#colecao"
              onClick={() =>
                setMenuOpen(false)
              }
              className="border-b border-black/10 py-3 text-[9px] uppercase tracking-[0.3em] md:border-0"
            >
              Coleção
            </Link>

            <Link
              href="/#sobre"
              onClick={() =>
                setMenuOpen(false)
              }
              className="border-b border-black/10 py-3 text-[9px] uppercase tracking-[0.3em] md:border-0"
            >
              Saint Marin
            </Link>

            <a
              href="https://www.instagram.com/saintmarinbr_/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-3 text-[9px] uppercase tracking-[0.3em]"
            >
              <InstagramIcon size={14} />
              Instagram
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}