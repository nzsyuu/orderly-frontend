"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Settings,
  ChefHat,
  LogOut,
} from "lucide-react";
import { useLogout, useSession } from "@/modules/auth/hooks/use-auth";

const navItems = [
  { label: "Painel", icon: LayoutDashboard, href: null },
  { label: "Estoque", icon: Boxes, href: "/estoque" },
  { label: "Produtos", icon: Package, href: "/produtos" },
  { label: "Vendas", icon: ShoppingCart, href: null },
  { label: "Fornecedores", icon: Users, href: null },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "OR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const session = useSession();
  const logout = useLogout();
  const displayName =
    session.data?.name ?? (session.isPending ? "Carregando..." : "Usuário");
  const displayEmail = session.data?.email ?? "";

  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 flex-col lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-9 w-9 items-center justify-center rounded-sm">
          <ChefHat className="h-5 w-5" />
        </div>
        <span className="font-display text-lg font-bold tracking-tight">
          Orderly
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        <p className="text-sidebar-foreground/50 px-3 pb-2 text-xs font-medium tracking-wider uppercase">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = item.href !== null && pathname === item.href;
          const className = `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/70"
          } ${
            item.href
              ? "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              : "cursor-not-allowed opacity-50"
          }`;

          if (!item.href) {
            return (
              <span key={item.label} aria-disabled="true" className={className}>
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-sidebar-border border-t p-3">
        <span
          aria-disabled="true"
          className="text-sidebar-foreground/70 flex cursor-not-allowed items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium opacity-50"
        >
          <Settings className="h-[18px] w-[18px]" />
          Configurações
        </span>
        <button
          type="button"
          onClick={() => logout.mutate()}
          className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-1 flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {logout.isPending ? "Saindo..." : "Sair"}
        </button>
        <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="bg-sidebar-accent text-sidebar-accent-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
            {initials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            {displayEmail ? (
              <p className="text-sidebar-foreground/50 truncate text-xs">
                {displayEmail}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
