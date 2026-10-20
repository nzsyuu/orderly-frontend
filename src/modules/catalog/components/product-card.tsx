"use client";

import Image from "next/image";
import { Plus, UtensilsCrossed } from "lucide-react";
import type { Product } from "@/modules/products/types/product";
import { formatBRL } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type ProductCardProps = {
  product: Product;
  onClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isAdding?: boolean;
  /** Loja fechada ou pausada: o botão fica indisponível. */
  disabled?: boolean;
};

export function ProductCard({
  product,
  onClick,
  onAddToCart,
  isAdding,
  disabled,
}: ProductCardProps) {
  return (
    <article className="border-border bg-card hover:border-foreground/25 group flex flex-col overflow-hidden rounded-2xl border transition-colors">
      <button
        type="button"
        onClick={() => onClick(product)}
        className="bg-muted relative flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden focus:outline-none"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <UtensilsCrossed className="text-muted-foreground/35 size-12" />
        )}
      </button>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <button
          type="button"
          onClick={() => onClick(product)}
          className="font-condensed text-foreground group-hover:text-primary text-left text-xl leading-snug font-extrabold transition-colors focus:outline-none"
        >
          {product.name}
        </button>

        {product.description ? (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="font-condensed tabular text-foreground text-2xl font-extrabold">
            {formatBRL(product.price)}
          </span>

          <button
            type="button"
            disabled={isAdding || disabled}
            title={
              disabled ? "A loja não está aceitando pedidos agora" : undefined
            }
            onClick={() => onAddToCart(product)}
            className={cn(
              "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <Plus className="size-4" />
            {isAdding
              ? "Adicionando..."
              : disabled
                ? "Indisponível"
                : "Adicionar"}
          </button>
        </div>
      </div>
    </article>
  );
}
