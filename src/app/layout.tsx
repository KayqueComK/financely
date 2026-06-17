import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Financely - Gestão Financeira Inteligente",
  description: "Gerencie suas finanças de forma simples, elegante e inteligente. Controle receitas, despesas, gráficos interativos e cotação em tempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
