import type { Metadata } from "next";

import { CartProvider } from "@/modules/cart/cart-context";

import "./globals.css";

export const metadata: Metadata = {
  title: "Saint Marin | Premium Clothing",
  description:
    "Saint Marin — Premium clothing. Est. 2025.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}