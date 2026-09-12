"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { formatBRL } from "@/shared/lib/format";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { useStockItems } from "@/modules/inventory/hooks/use-stock-items";
import type {
  Product,
  ProductComposition,
} from "@/modules/products/types/product";
import {
  addCompositionFormSchema,
  type AddCompositionFormValues,
} from "@/modules/products/schemas/product-form";
import {
  useAddComposition,
  useProductCompositions,
  useRemoveComposition,
  useUpdateComposition,
} from "@/modules/products/hooks/use-products";

type ProductDrawerProps = {
  product: Product | null;
  onClose: () => void;
};

export function ProductDrawer({ product, onClose }: ProductDrawerProps) {
  const productId = product?.id ?? null;
  const compositionsQuery = useProductCompositions(productId);
  const stockItemsQuery = useStockItems();
  const addComposition = useAddComposition(productId);
  const updateComposition = useUpdateComposition(productId);
  const removeComposition = useRemoveComposition(productId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCompositionFormValues>({
    resolver: zodResolver(addCompositionFormSchema),
    defaultValues: {
      stockItemId: 0,
      quantity: 1,
    },
  });

  const compositions = compositionsQuery.data;
  const stockItems = stockItemsQuery.data;

  const availableStockItems = useMemo(() => {
    const usedIds = new Set(
      (compositions ?? []).map((item) => item.stockItemId),
    );
    return (stockItems ?? []).filter(
      (item) => item.active && !usedIds.has(item.id),
    );
  }, [compositions, stockItems]);

  useEffect(() => {
    if (!product) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Fechar painel"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Receita de ${product.name}`}
        className="border-border bg-card relative z-10 flex h-full w-full max-w-md flex-col border-l shadow-xl"
      >
        <header className="border-border flex items-start justify-between gap-3 border-b p-5">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              Receita
            </p>
            <h2 className="font-display text-foreground truncate text-xl font-bold">
              {product.name}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {formatBRL(product.price)}
              {product.description ? ` · ${product.description}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="border-border text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg border"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {compositionsQuery.isLoading && (
            <p className="text-muted-foreground text-sm">
              Carregando composição...
            </p>
          )}

          {compositionsQuery.isError && (
            <p className="text-destructive text-sm">
              Não foi possível carregar a receita.
            </p>
          )}

          {!compositionsQuery.isLoading &&
            !compositionsQuery.isError &&
            (compositions ?? []).length === 0 && (
              <p className="text-muted-foreground text-sm">
                Este produto ainda não tem ingredientes.
              </p>
            )}

          <ul className="flex flex-col gap-2">
            {(compositions ?? []).map((item) => {
              const stockItem = (stockItems ?? []).find(
                (stock) => stock.id === item.stockItemId,
              );
              return (
                <CompositionRow
                  key={`${item.id}-${item.quantity}`}
                  item={item}
                  unit={stockItem?.unit ?? "un"}
                  name={
                    stockItem
                      ? stockItem.active
                        ? stockItem.name
                        : `${stockItem.name} (inativo)`
                      : `Item #${item.stockItemId}`
                  }
                  pending={
                    updateComposition.isPending || removeComposition.isPending
                  }
                  onSave={(quantity) =>
                    updateComposition.mutateAsync({
                      compositionId: item.id,
                      input: { quantity },
                    })
                  }
                  onRemove={() => removeComposition.mutate(item.id)}
                />
              );
            })}
          </ul>

          {updateComposition.isError && (
            <p className="text-destructive mt-3 text-sm">
              {getApiErrorMessage(
                updateComposition.error,
                "Não foi possível atualizar a quantidade.",
              )}
            </p>
          )}

          {removeComposition.isError && (
            <p className="text-destructive mt-3 text-sm">
              {getApiErrorMessage(
                removeComposition.error,
                "Não foi possível remover o ingrediente.",
              )}
            </p>
          )}

          <form
            className="border-border mt-6 flex flex-col gap-3 border-t pt-5"
            onSubmit={handleSubmit(async (values) => {
              await addComposition.mutateAsync(values);
              reset({ stockItemId: 0, quantity: 1 });
            })}
          >
            <p className="text-foreground text-sm font-medium">
              Adicionar ingrediente
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">
                Item de estoque
              </span>
              <select
                {...register("stockItemId", { valueAsNumber: true })}
                className="border-input bg-background focus:border-ring focus:ring-ring/30 h-10 rounded-lg border px-3 text-sm outline-none focus:ring-2"
              >
                <option value={0}>Selecione</option>
                {availableStockItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {errors.stockItemId && (
                <span className="text-destructive text-xs">
                  {errors.stockItemId.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">
                Quantidade por unidade
              </span>
              <input
                type="number"
                min={1}
                {...register("quantity", { valueAsNumber: true })}
                className="border-input bg-background focus:border-ring focus:ring-ring/30 h-10 rounded-lg border px-3 text-sm outline-none focus:ring-2"
              />
              {errors.quantity && (
                <span className="text-destructive text-xs">
                  {errors.quantity.message}
                </span>
              )}
            </label>

            {addComposition.isError && (
              <p className="text-destructive text-sm">
                {getApiErrorMessage(
                  addComposition.error,
                  "Não foi possível adicionar o ingrediente.",
                )}
              </p>
            )}

            <Button
              type="submit"
              disabled={
                addComposition.isPending || availableStockItems.length === 0
              }
            >
              {addComposition.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </form>
        </div>
      </aside>
    </div>
  );
}

function CompositionRow({
  item,
  name,
  unit,
  pending,
  onSave,
  onRemove,
}: {
  item: ProductComposition;
  name: string;
  unit: string;
  pending: boolean;
  onSave: (quantity: number) => Promise<unknown>;
  onRemove: () => void;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const dirty = quantity !== item.quantity;

  return (
    <li className="border-border flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">{name}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="border-input bg-background focus:border-ring focus:ring-ring/30 h-8 w-16 rounded-lg border px-2 text-sm outline-none focus:ring-2"
            aria-label={`Quantidade de ${name}`}
          />
          <span className="text-muted-foreground text-xs">
            {unit} por unidade
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {dirty && (
          <Button
            type="button"
            size="sm"
            disabled={pending || !Number.isInteger(quantity) || quantity < 1}
            onClick={() => void onSave(quantity).catch(() => {})}
          >
            Salvar
          </Button>
        )}
        <button
          type="button"
          aria-label={`Remover ${name}`}
          disabled={pending}
          onClick={onRemove}
          className="border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
