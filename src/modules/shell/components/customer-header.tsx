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
export function CustomerHeader({
  title,
  backHref,
  backLabel,
}: CustomerHeaderProps) {
  return (
    <header className="border-border bg-card sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-condensed text-foreground min-w-0 flex-1 truncate text-xl font-extrabold">
          {title}
        </h1>
        <UserMenu />
      </div>
    </header>
  );
}
