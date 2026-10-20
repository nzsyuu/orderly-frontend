"use client";

import Link from "next/link";
import { ChefHat, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { StoreHoursPill } from "@/modules/stores/components/store-hours-pill";

const titles: Record<string, string> = {
  "/painel": "Painel do dia",
  "/painel/pedidos": "Pedidos",
  "/loja": "Loja",
  "/estoque": "Estoque",
  "/produtos": "Produtos",
  "/relatorios/vendas": "Relatório de vendas",
  "/relatorios/estoque": "Relatório de estoque",
};

type TopbarProps = {
  onOpenMenu?: () => void;
};

/** Barra compacta exibida em telas menores para abrir o menu lateral. */
export function Topbar({ onOpenMenu }: TopbarProps) {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Orderly";

  return (
    <header className="border-sidebar-border bg-sidebar text-sidebar-foreground sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b px-4 lg:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
          className="text-sidebar-foreground hover:bg-sidebar-accent -ml-1 flex size-9 items-center justify-center rounded-lg transition-colors"
        >
          <Menu className="size-5" />
        </button>
        <Link href="/painel" className="flex items-center gap-2">
          <span className="bg-brand text-brand-foreground flex size-7 items-center justify-center rounded-md">
            <ChefHat className="size-4" />
          </span>
          <span className="font-condensed truncate text-base font-bold">
            {title}
          </span>
        </Link>
      </div>

      <div className="[&_span]:text-sidebar-foreground/80">
        <StoreHoursPill />
      </div>
    </header>
  );
}
