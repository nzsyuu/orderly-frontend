"use client";

import Link from "next/link";
import { ChefHat, ShoppingCart, User, LogOut } from "lucide-react";
import { useSession, useLogout } from "@/modules/auth/hooks/use-auth";
import { useCart } from "@/modules/cart/hooks/use-cart";

type CatalogNavbarProps = {
  onCartClick: () => void;
};

export function CatalogNavbar({ onCartClick }: CatalogNavbarProps) {
  const session = useSession();
  const logout = useLogout();
  const isLoggedIn = !!session.data;
  const cart = useCart(isLoggedIn);
  const itemCount = cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="border-border bg-card sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/cardapio" className="flex items-center gap-2.5">
          <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-sm">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="font-display text-foreground text-lg font-bold tracking-tight">
            Orderly
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => logout.mutate()}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
              <button
                type="button"
                onClick={onCartClick}
                className="text-muted-foreground hover:text-foreground relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <User className="h-4 w-4" />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
