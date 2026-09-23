"use client";

import { useEffect } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "@/modules/cart/hooks/use-cart";
import { formatBRL } from "@/shared/lib/format";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const cart = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

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
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="border-border bg-card relative z-10 flex w-full max-w-md flex-col border-l shadow-xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-foreground h-5 w-5" />
            <h2 className="font-display text-foreground text-lg font-bold">
              Seu Carrinho
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.isPending ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              Carregando carrinho...
            </p>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="text-muted-foreground/30 mb-3 h-14 w-14" />
              <p className="text-muted-foreground text-sm font-medium">
                Seu carrinho está vazio
              </p>
              <p className="text-muted-foreground/70 mt-1 text-xs">
                Adicione itens do cardápio para começar
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="border-border flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-semibold">
                      {item.productName}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatBRL(item.unitPrice)} cada
                    </p>
                    <p className="text-foreground mt-1 text-sm font-bold">
                      {formatBRL(item.totalPrice)}
                    </p>
                    {item.observation && (
                      <p className="text-muted-foreground mt-1 rounded-md bg-muted/50 p-2 text-xs italic">
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
                      className="border-border text-muted-foreground hover:bg-muted flex h-7 w-7 items-center justify-center rounded-md border transition-colors disabled:opacity-50"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-foreground w-6 text-center text-sm font-semibold">
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
                      className="border-border text-muted-foreground hover:bg-muted flex h-7 w-7 items-center justify-center rounded-md border transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={removeItem.isPending}
                      onClick={() => removeItem.mutate(item.productId)}
                      className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 ml-1 flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
            <div className="mb-4 flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Total</span>
              <span className="font-display text-foreground text-xl font-bold">
                {formatBRL(subTotal)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={clearCart.isPending}
                onClick={() => clearCart.mutate()}
                className="border-border text-muted-foreground hover:bg-muted flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Limpar
              </button>
              <button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-[2] rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Finalizar pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
