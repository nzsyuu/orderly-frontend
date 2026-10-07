"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserMenu } from "@/modules/shell/components/user-menu";

type CustomerHeaderProps = {
  title: string;
  backHref: string;
  backLabel: string;
};

/** Header simples para as páginas da área do cliente (`/conta` e `/pedidos/*`). */
export function CustomerHeader({ title, backHref, backLabel }: CustomerHeaderProps) {
  return (
    <header className="border-border bg-card sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-lg p-1.5 transition-colors outline-none focus-visible:ring-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-foreground min-w-0 flex-1 truncate text-lg font-bold">
          {title}
        </h1>
        <UserMenu />
      </div>
    </header>
  );
}
