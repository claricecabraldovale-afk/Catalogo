import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leo Bebidas - Catálogo Online e Delivery",
  description: "Bebidas geladas com entrega rápida. Cervejas, vinhos, destilados e mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-bg text-text font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}