"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChefHat,
  ChevronDown,
  LayoutDashboard,
  MapPin,
  ShoppingCart,
  User,
} from "lucide-react";
import { AddressFormModal } from "@/modules/address/components/address-form-modal";
import { AddressSelectorModal } from "@/modules/address/components/address-selector-modal";
import { useAddresses } from "@/modules/address/hooks/use-address";
import type { Address } from "@/modules/address/types/address";
import { useSession } from "@/modules/auth/hooks/use-auth";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { UserMenu } from "@/modules/shell/components/user-menu";
import { StoreHoursPill } from "@/modules/stores/components/store-hours-pill";

type CatalogNavbarProps = {
  onCartClick: () => void;
};

export function CatalogNavbar({ onCartClick }: CatalogNavbarProps) {
  const session = useSession();
  const isLoggedIn = !!session.data;
  const isAdmin = session.data?.role === "ROLE_ADMIN";
  const cart = useCart(isLoggedIn);
  const addresses = useAddresses(isLoggedIn);
  const itemCount =
    cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const [overrideAddressId, setOverrideAddressId] = useState<string | null>(
    null,
  );
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const activeAddress = useMemo<Address | null>(() => {
    const list = addresses.data;
    if (!list || list.length === 0) return null;

    if (overrideAddressId) {
      const found = list.find((a) => a.addressId === overrideAddressId);
      if (found) return found;
    }

    const storedId =
      typeof window !== "undefined"
        ? localStorage.getItem("activeAddressId")
        : null;
    if (storedId) {
      const found = list.find((a) => a.addressId === storedId);
      if (found) return found;
    }

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
              <div className="bg-primary text-brand flex size-9 items-center justify-center rounded-xl">
                <ChefHat className="size-5" />
              </div>
              <span className="font-condensed text-foreground text-xl font-extrabold">
                Orderly
              </span>
            </Link>

            <div className="border-border ml-1 hidden border-l pl-4 sm:block">
              <StoreHoursPill />
            </div>

            {isLoggedIn && (
              <div className="ml-1 hidden sm:block">
                <span className="text-border mx-2">·</span>
                {hasAddresses && activeAddress ? (
                  <button
                    type="button"
                    onClick={() => setSelectorOpen(true)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
                  >
                    <MapPin className="text-primary size-3.5 shrink-0" />
                    <span className="max-w-[200px] truncate">
                      Entregar em{" "}
                      <strong className="text-foreground font-semibold">
                        {activeAddress.name}
                      </strong>
                    </span>
                    <ChevronDown className="size-3 opacity-60 transition-transform group-hover:opacity-100" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFormOpen(true)}
                    className="text-primary hover:bg-muted inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
                  >
                    <MapPin className="size-3.5" />
                    Cadastrar endereço
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/painel"
                className="border-border bg-muted/60 text-foreground hover:bg-muted hidden items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors sm:inline-flex"
              >
                <LayoutDashboard className="size-3.5" />
                Painel da loja
              </Link>
            )}

            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    hasAddresses ? setSelectorOpen(true) : setFormOpen(true)
                  }
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:hidden"
                >
                  <MapPin className="text-primary size-4" />
                  {activeAddress ? (
                    <span className="max-w-[80px] truncate">
                      {activeAddress.name}
                    </span>
                  ) : (
                    <span>Endereço</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onCartClick}
                  aria-label="Abrir sacola"
                  className="border-border bg-muted/60 text-foreground hover:bg-muted relative inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors"
                >
                  <ShoppingCart className="size-4" />
                  {itemCount > 0 ? (
                    <span className="bg-brand text-brand-foreground tabular inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-extrabold">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  ) : (
                    <span className="text-muted-foreground hidden text-xs sm:inline">
                      Sacola
                    </span>
                  )}
                </button>
                <UserMenu />
              </>
            ) : (
              <Link
                href="/login"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors"
              >
                <User className="size-4" />
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
