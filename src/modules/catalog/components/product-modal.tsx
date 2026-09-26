"use client";

import { useEffect, useState } from "react";
import { X, Minus, Plus, ShoppingCart, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { useProduct } from "@/modules/products/hooks/use-products";
import { formatBRL } from "@/shared/lib/format";

type ProductModalProps = {
  productId: number | null;
  onClose: () => void;
  onAddToCart: (productId: number, quantity: number, observation: string) => void;
  isAdding?: boolean;
};

export function ProductModal({
  productId,
  onClose,
  onAddToCart,
  isAdding,
}: ProductModalProps) {
  const productQuery = useProduct(productId);
  const product = productQuery.data;

  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");

  useEffect(() => {
    if (!productId) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [productId, onClose]);

  useEffect(() => {
    if (productId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [productId]);

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="border-border bg-card relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border shadow-2xl">
        {/* Header/Image */}
        <div className="relative">
          {product?.imageUrl ? (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 448px) 100vw, 448px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="bg-accent/50 flex aspect-[4/3] w-full items-center justify-center">
              <UtensilsCrossed className="text-muted-foreground/40 h-16 w-16" />
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur hover:bg-black/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {productQuery.isPending ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground text-sm">Carregando produto...</p>
          </div>
        ) : productQuery.isError || !product ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-destructive text-sm">Erro ao carregar o produto.</p>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <h2 className="font-display text-foreground text-xl font-bold tracking-tight">
                {product.name}
              </h2>
              <p className="font-display text-primary mt-1 text-lg font-semibold">
                {formatBRL(product.price)}
              </p>
              
              {product.description && (
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="observation" className="text-foreground mb-2 block text-sm font-medium">
                    Alguma observação?
                  </label>
                  <textarea
                    id="observation"
                    rows={2}
                    placeholder="Ex: Tirar cebola, ponto da carne, etc..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="border-input bg-background focus:border-ring focus:ring-ring/30 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <span className="text-foreground mb-2 block text-sm font-medium">
                    Quantidade
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="border-border text-muted-foreground hover:bg-muted flex h-10 w-10 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-foreground w-8 text-center font-semibold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="border-border text-muted-foreground hover:bg-muted flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-border border-t p-5">
              <button
                type="button"
                disabled={isAdding}
                onClick={() => onAddToCart(product.id, quantity, observation)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>
                  {isAdding ? "Adicionando..." : "Adicionar ao carrinho"}
                </span>
                {!isAdding && (
                  <span className="ml-1 opacity-90">
                    • {formatBRL(product.price * quantity)}
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
