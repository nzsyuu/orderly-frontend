"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Boxes, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type ReportSwitcherProps = {
  active: "vendas" | "estoque";
};

export function ReportSwitcher({ active }: ReportSwitcherProps) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  const tabs = [
    {
      id: "vendas" as const,
      label: "Vendas e receita",
      href: `/relatorios/vendas${suffix}`,
      icon: TrendingUp,
    },
    {
      id: "estoque" as const,
      label: "Estoque e perdas",
      href: `/relatorios/estoque${suffix}`,
      icon: Boxes,
    },
  ];

  return (
    <nav
      aria-label="Alternar relatório"
      className="bg-muted inline-flex items-center gap-0.5 rounded-xl p-1"
    >
      {tabs.map((tab) => {
        const isCurrent = tab.id === active;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
              isCurrent
                ? "bg-card text-foreground shadow-[0_1px_2px_rgb(15_26_19/0.12)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
