"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ChefHat, ShoppingCart, User, MapPin, ChevronDown } from "lucide-react";
import { useSession } from "@/modules/auth/hooks/use-auth";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { useAddresses } from "@/modules/address/hooks/use-address";
import { AddressSelectorModal } from "@/modules/address/components/address-selector-modal";
import { AddressFormModal } from "@/modules/address/components/address-form-modal";
import type { Address } from "@/modules/address/types/address";
import { UserMenu } from "@/modules/shell/components/user-menu";

type CatalogNavbarProps = {
  onCartClick: () => void;
};

export function CatalogNavbar({ onCartClick }: CatalogNavbarProps) {
  const session = useSession();
  const isLoggedIn = !!session.data;
  const cart = useCart(isLoggedIn);
  const addresses = useAddresses(isLoggedIn);
  const itemCount = cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const [overrideAddressId, setOverrideAddressId] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Derive active address from data without setState in an effect
  const activeAddress = useMemo<Address | null>(() => {
    const list = addresses.data;
    if (!list || list.length === 0) return null;

    // If user explicitly selected one in this session, use that
    if (overrideAddressId) {
      const found = list.find((a) => a.addressId === overrideAddressId);
      if (found) return found;
    }

    // Otherwise, check localStorage
    const storedId = typeof window !== "undefined" ? localStorage.getItem("activeAddressId") : null;
    if (storedId) {
      const found = list.find((a) => a.addressId === storedId);
      if (found) return found;
    }

    // Fallback to first address and persist
    const first = list[0];
    if (typeof window !== "undefined") {
      localStorage.setItem("activeAddressId", first.addressId);
    }
    return first;
  }, [addresses.data, overrideAddressId]);

  const handleSelect = useCallback((address: Address) => {
    setOverrideAddressId(address.addressId);
    localStorage.setItem("activeAddressId", address.addressId);
  }, []);

  const hasAddresses = (addresses.data?.length ?? 0) > 0;

  return (
    <>
      <header className="border-border bg-card sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/cardapio" className="flex items-center gap-2.5">
              <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-sm">
                <ChefHat className="h-5 w-5" />
              </div>
              <span className="font-display text-foreground text-lg font-bold tracking-tight">
                Orderly
              </span>
            </Link>

            {/* Address indicator (only when logged in) */}
            {isLoggedIn && (
              <div className="ml-1 hidden sm:block">
                <span className="text-border mx-2">|</span>
                {hasAddresses && activeAddress ? (
                  <button
                    type="button"
                    onClick={() => setSelectorOpen(true)}
                    className="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
                  >
                    <MapPin className="text-primary h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-[180px] truncate">
                      Entregando em <strong className="text-foreground">{activeAddress.name}</strong>
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50 transition-transform group-hover:opacity-100" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFormOpen(true)}
                    className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Cadastrar endereço
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* Mobile address button */}
                <button
                  type="button"
                  onClick={() =>
                    hasAddresses ? setSelectorOpen(true) : setFormOpen(true)
                  }
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:hidden"
                >
                  <MapPin className="text-primary h-4 w-4" />
                  {activeAddress ? (
                    <span className="max-w-[80px] truncate">{activeAddress.name}</span>
                  ) : (
                    <span>Endereço</span>
                  )}
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
                <UserMenu />
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

      <AddressSelectorModal
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        activeAddressId={activeAddress?.addressId ?? null}
        onSelect={handleSelect}
      />
      <AddressFormModal
        key={formOpen ? "open" : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={(address) => {
          handleSelect(address);
          setFormOpen(false);
        }}
      />
    </>
  );
}
