import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

// Archivo variável (peso + largura): uma família só, com a largura
// fazendo o papel de "display" nos números e títulos condensados.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Orderly - Gestão de Estoque",
  description: "Controle de estoque para restaurantes e lanchonetes",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`light bg-background ${archivo.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
