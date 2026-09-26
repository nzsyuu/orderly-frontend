"use client";

import { ShoppingCart, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/modules/products/types/product";
import { formatBRL } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type ProductCardProps = {
  product: Product;
  onClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isAdding?: boolean;
};

export function ProductCard({ product, onClick, onAddToCart, isAdding }: ProductCardProps) {
  return (
    <div className="border-border bg-card group flex flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
      <button 
        type="button" 
        onClick={() => onClick(product)}
        className="bg-accent/50 relative flex aspect-[4/3] w-full items-center justify-center cursor-pointer hover:bg-accent/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <UtensilsCrossed className="text-muted-foreground/40 h-12 w-12" />
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <button 
          type="button" 
          onClick={() => onClick(product)}
          className="text-left font-display text-foreground text-base font-bold tracking-tight hover:underline focus:outline-none"
        >
          {product.name}
        </button>

        {product.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="font-display text-foreground text-lg font-bold">
            {formatBRL(product.price)}
          </span>

          <button
            type="button"
            disabled={isAdding}
            onClick={() => onAddToCart(product)}
            className={cn(
              "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            {isAdding ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
