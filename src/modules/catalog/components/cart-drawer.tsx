"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/modules/cart/hooks/use-cart";
import { formatBRL } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const cart = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      void cart.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const items = cart.data?.items ?? [];
  const subTotal = cart.data?.subTotal ?? 0;
  const isEmpty = items.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fechar carrinho"
        className="animate-fade-in absolute inset-0 bg-[#0f1a13]/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="border-border bg-card animate-slide-in-right relative z-10 flex w-full max-w-md flex-col border-l shadow-2xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="text-foreground size-5" />
            <h2 className="font-condensed text-foreground text-xl font-extrabold">
              Sua sacola
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.isPending ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              Carregando sacola...
            </p>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="text-muted-foreground/30 mb-3 size-12" />
              <p className="text-foreground text-sm font-semibold">
                Sua sacola está vazia
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Escolha itens do cardápio para montar seu pedido.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="border-border flex items-start gap-3 rounded-xl border p-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-semibold">
                      {item.productName}
                    </p>
                    <p className="text-muted-foreground tabular mt-0.5 text-xs">
                      {formatBRL(item.unitPrice)} cada
                    </p>
                    <p className="font-condensed tabular text-foreground mt-1 text-lg font-extrabold">
                      {formatBRL(item.totalPrice)}
                    </p>
                    {item.observation && (
                      <p className="bg-muted text-muted-foreground mt-1.5 rounded-lg p-2 text-xs">
                        Obs: {item.observation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={updateItem.isPending}
                      onClick={() =>
                        updateItem.mutate({
                          productId: item.productId,
                          input: { quantity: item.quantity - 1 },
                        })
                      }
                      className="border-border text-muted-foreground hover:bg-muted flex size-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="text-foreground tabular w-6 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={updateItem.isPending}
                      onClick={() =>
                        updateItem.mutate({
                          productId: item.productId,
                          input: { quantity: item.quantity + 1 },
                        })
                      }
                      className="border-border text-muted-foreground hover:bg-muted flex size-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
                    >
                      <Plus className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={removeItem.isPending}
                      onClick={() => removeItem.mutate(item.productId)}
                      className="text-destructive/75 hover:text-destructive hover:bg-destructive/10 ml-1 flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-border border-t p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span className="font-condensed tabular text-foreground text-2xl font-extrabold">
                {formatBRL(subTotal)}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={clearCart.isPending}
                onClick={() => clearCart.mutate()}
                className="flex-1"
              >
                Limpar
              </Button>
              <Button
                type="button"
                variant="brand"
                onClick={() => {
                  onClose();
                  router.push("/checkout");
                }}
                className="flex-[2]"
              >
                Fechar pedido
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
