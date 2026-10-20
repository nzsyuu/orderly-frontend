"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChefHat,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Store as StoreIcon,
  TrendingUp,
  X,
} from "lucide-react";
import { useLogout, useSession } from "@/modules/auth/hooks/use-auth";
import { useSales } from "@/modules/sales/hooks/use-sales";
import { useStore } from "@/modules/stores/hooks/use-stores";
import type { StoreStatus } from "@/modules/stores/types/store";
import { cn } from "@/shared/lib/utils";

const storeDotClass: Record<StoreStatus, string> = {
  ABERTA: "bg-[#3dd668]",
  PAUSADA: "bg-brand",
  FECHADA: "bg-sidebar-foreground/35",
};

const storeLabel: Record<StoreStatus, string> = {
  ABERTA: "Aberta",
  PAUSADA: "Pausada",
  FECHADA: "Fechada",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "OR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const session = useSession();
  const logout = useLogout();
  const storeQuery = useStore();
  const salesQuery = useSales();

  const pendingOrdersCount = (salesQuery.data ?? []).filter(
    (sale) => sale.status === "PENDENTE",
  ).length;
  const activeOrdersCount = (salesQuery.data ?? []).filter(
    (sale) =>
      sale.status === "PENDENTE" ||
      sale.status === "EM_PREPARO" ||
      sale.status === "EM_ROTA",
  ).length;

  const store = storeQuery.data;
  const displayName =
    session.data?.name ?? (session.isPending ? "Carregando..." : "Usuário");
  const displayEmail = session.data?.email ?? "";

  const groups = [
    {
      title: "Turno",
      items: [
        {
          label: "Pedidos",
          icon: ClipboardList,
          href: "/painel/pedidos",
          badge:
            pendingOrdersCount > 0 ? (
              <span
                title={`${pendingOrdersCount} aguardando aceite`}
                className="bg-brand text-brand-foreground tabular ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold"
              >
                {pendingOrdersCount}
              </span>
            ) : activeOrdersCount > 0 ? (
              <span
                title={`${activeOrdersCount} em andamento`}
                className="bg-sidebar-accent text-sidebar-foreground/85 tabular ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
              >
                {activeOrdersCount}
              </span>
            ) : null,
        },
        {
          label: "Loja",
          icon: StoreIcon,
          href: "/loja",
          badge: store ? (
            <span className="text-sidebar-foreground/70 ml-auto inline-flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "size-2 rounded-full",
                  storeDotClass[store.status],
                )}
              />
              {storeLabel[store.status]}
            </span>
          ) : null,
        },
      ],
    },
    {
      title: "Planejamento",
      items: [
        {
          label: "Painel do dia",
          icon: LayoutDashboard,
          href: "/painel",
          badge: null,
        },
        {
          label: "Estoque",
          icon: Boxes,
          href: "/estoque",
          badge: null,
        },
        {
          label: "Produtos",
          icon: Package,
          href: "/produtos",
          badge: null,
        },
      ],
    },
    {
      title: "Relatórios",
      items: [
        {
          label: "Vendas",
          icon: TrendingUp,
          href: "/relatorios/vendas",
          badge: null,
        },
        {
          label: "Estoque e perdas",
          icon: BarChart3,
          href: "/relatorios/estoque",
          badge: null,
        },
      ],
    },
  ];

  const content = (
    <div className="bg-sidebar text-sidebar-foreground flex h-full w-64 flex-col">
      {/* Marca */}
      <div className="border-sidebar-border flex h-16 items-center justify-between border-b px-5">
        <Link
          href="/painel"
          onClick={onMobileClose}
          className="flex items-center gap-2.5"
        >
          <span className="bg-brand text-brand-foreground flex size-9 items-center justify-center rounded-lg">
            <ChefHat className="size-5" />
          </span>
          <div className="leading-none">
            <span className="font-condensed text-sidebar-foreground block text-xl font-extrabold">
              Orderly
            </span>
            <span className="text-sidebar-foreground/55 block text-[11px]">
              Operação da loja
            </span>
          </div>
        </Link>

        {onMobileClose ? (
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Fechar menu"
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground flex size-8 items-center justify-center rounded-lg lg:hidden"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Navegação agrupada por atividade */}
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <p className="text-sidebar-foreground/45 px-3 pb-1 text-xs font-medium">
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand text-brand-foreground font-semibold"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="size-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {!isActive ? item.badge : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Rodapé da barra lateral */}
      <div className="border-sidebar-border border-t p-3">
        <Link
          href="/cardapio"
          onClick={onMobileClose}
          className="text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
        >
          <span>Ver cardápio do cliente</span>
          <ExternalLink className="size-3.5 opacity-70" />
        </Link>

        <Link
          href="/conta"
          onClick={onMobileClose}
          aria-current={pathname === "/conta" ? "page" : undefined}
          className={cn(
            "mt-0.5 flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
            pathname === "/conta"
              ? "bg-brand text-brand-foreground font-semibold"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <Settings className="size-4" />
          Minha conta
        </Link>

        <button
          type="button"
          onClick={() => logout.mutate()}
          className="text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mt-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
        >
          <LogOut className="size-4" />
          {logout.isPending ? "Saindo..." : "Sair"}
        </button>

        <div className="border-sidebar-border mt-2 flex items-center gap-2.5 border-t px-2 pt-3">
          <div className="bg-sidebar-accent text-sidebar-accent-foreground font-condensed flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {initials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{displayName}</p>
            {displayEmail ? (
              <p className="text-sidebar-foreground/55 truncate text-[11px]">
                {displayEmail}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden shrink-0 lg:sticky lg:top-0 lg:flex lg:h-screen">
        {content}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Fechar navegação"
            className="animate-fade-in absolute inset-0 bg-[#0f1a13]/55"
            onClick={onMobileClose}
          />
          <div className="animate-slide-in-left relative z-10 h-full">
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}
