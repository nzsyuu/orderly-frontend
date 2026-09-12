"use client";

import { ChefHat } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "@/modules/auth/hooks/use-auth";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/estoque": {
    title: "Estoque",
    subtitle: "Acompanhe insumos e produtos da sua operação",
  },
  "/produtos": {
    title: "Produtos",
    subtitle: "Catálogo de lanches e receitas da operação",
  },
};

export function Topbar() {
  const pathname = usePathname();
  const page = titles[pathname] ?? {
    title: "Orderly",
    subtitle: "Gestão de lanchonetes",
  };
  const session = useSession();
  const initials =
    session.data?.name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "OR";

  return (
    <header className="border-sidebar-border bg-sidebar text-sidebar-foreground flex h-16 items-center justify-between gap-4 border-b px-5 lg:px-8">
      <div className="flex items-center gap-2.5">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-8 w-8 items-center justify-center rounded-sm lg:hidden">
          <ChefHat className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-sidebar-foreground text-lg leading-tight font-bold tracking-tight">
            {page.title}
          </h1>
          <p className="text-sidebar-foreground/60 hidden text-xs sm:block">
            {page.subtitle}
          </p>
        </div>
      </div>

      <div className="bg-sidebar-accent text-sidebar-accent-foreground flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold lg:hidden">
        {initials}
      </div>
    </header>
  );
}
