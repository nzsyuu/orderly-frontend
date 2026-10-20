"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, UtensilsCrossed, X } from "lucide-react";
import { useProduct } from "@/modules/products/hooks/use-products";
import { formatBRL } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { fieldClassName } from "@/shared/ui/modal";

type ProductModalProps = {
  productId: number | null;
  onClose: () => void;
  onAddToCart: (
    productId: number,
    quantity: number,
    observation: string,
  ) => void;
  isAdding?: boolean;
  /** Loja fechada ou pausada: o botão fica indisponível. */
  disabled?: boolean;
};

export function ProductModal({
  productId,
  onClose,
  onAddToCart,
  isAdding,
  disabled,
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="animate-fade-in absolute inset-0 bg-[#0f1a13]/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="border-border bg-card animate-pop-in relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border shadow-2xl sm:rounded-2xl">
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
            <div className="bg-muted flex aspect-[4/3] w-full items-center justify-center">
              <UtensilsCrossed className="text-muted-foreground/35 size-16" />
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65"
          >
            <X className="size-5" />
          </button>
        </div>

        {productQuery.isPending ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Carregando produto...
            </p>
          </div>
        ) : productQuery.isError || !product ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-destructive text-sm">
              Erro ao carregar o produto.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-condensed text-foreground text-2xl font-extrabold">
                  {product.name}
                </h2>
                <span className="font-condensed tabular text-primary shrink-0 text-2xl font-extrabold">
                  {formatBRL(product.price)}
                </span>
              </div>

              {product.description && (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="observation"
                    className="text-foreground mb-1.5 block text-sm font-medium"
                  >
                    Alguma observação para a cozinha?
                  </label>
                  <textarea
                    id="observation"
                    rows={2}
                    placeholder="Ex: Tirar cebola, ponto da carne..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className={`${fieldClassName} h-auto resize-none py-2`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-foreground text-sm font-medium">
                    Quantidade
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="border-border text-muted-foreground hover:bg-muted flex size-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="text-foreground tabular w-8 text-center font-bold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="border-border text-muted-foreground hover:bg-muted flex size-9 items-center justify-center rounded-lg border transition-colors"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border border-t p-5">
              <Button
                type="button"
                size="lg"
                disabled={isAdding || disabled}
                onClick={() => onAddToCart(product.id, quantity, observation)}
                className="w-full"
              >
                <ShoppingCart className="size-5" />
                <span>
                  {isAdding
                    ? "Adicionando..."
                    : disabled
                      ? "Loja não está aceitando pedidos"
                      : "Adicionar à sacola"}
                </span>
                {!isAdding && !disabled && (
                  <span className="tabular ml-1 opacity-90">
                    · {formatBRL(product.price * quantity)}
                  </span>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
