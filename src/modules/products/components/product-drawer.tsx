"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CookingPot, Trash2, X } from "lucide-react";
import { useStockItems } from "@/modules/inventory/hooks/use-stock-items";
import {
  useAddComposition,
  useProductCompositions,
  useRemoveComposition,
  useUpdateComposition,
} from "@/modules/products/hooks/use-products";
import {
  addCompositionFormSchema,
  type AddCompositionFormValues,
} from "@/modules/products/schemas/product-form";
import type {
  Product,
  ProductComposition,
} from "@/modules/products/types/product";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { formatBRL, formatPercent } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { fieldClassName } from "@/shared/ui/modal";

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

  const recipeCost = useMemo(() => {
    const stockMap = new Map((stockItems ?? []).map((s) => [s.id, s.unitCost]));
    return (compositions ?? []).reduce((sum, comp) => {
      const unitCost = stockMap.get(comp.stockItemId) ?? 0;
      return sum + comp.quantity * unitCost;
    }, 0);
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

  const grossProfit = product.price - recipeCost;
  const marginPct = product.price > 0 ? (grossProfit / product.price) * 100 : 0;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Fechar painel"
        className="animate-fade-in absolute inset-0 bg-[#0f1a13]/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Receita de ${product.name}`}
        className="border-border bg-card animate-slide-in-right relative z-10 flex h-full w-full max-w-md flex-col border-l shadow-2xl"
      >
        <header className="border-border flex items-start justify-between gap-3 border-b p-5">
          <div className="min-w-0">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <CookingPot className="size-3.5" aria-hidden />
              <span>Ficha técnica</span>
            </div>
            <h2 className="font-condensed text-foreground mt-0.5 truncate text-2xl font-extrabold">
              {product.name}
            </h2>
            {product.description ? (
              <p className="text-muted-foreground mt-1 text-xs">
                {product.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-colors"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Resumo financeiro da ficha técnica (Preço vs. CMV estimado) */}
        <div className="border-border bg-muted/50 grid grid-cols-3 gap-2 border-b px-5 py-3">
          <div>
            <p className="text-muted-foreground text-[11px]">Preço</p>
            <p className="font-condensed tabular text-foreground text-lg font-extrabold">
              {formatBRL(product.price)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-[11px]">Custo (CMV)</p>
            <p className="font-condensed tabular text-foreground text-lg font-extrabold">
              {formatBRL(recipeCost)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-[11px]">Margem bruta</p>
            <p
              className={`font-condensed tabular text-lg font-extrabold ${
                marginPct >= 50
                  ? "text-success"
                  : marginPct >= 25
                    ? "text-foreground"
                    : "text-warning"
              }`}
            >
              {formatPercent(marginPct, 0)}
            </p>
          </div>
        </div>

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
                Este produto ainda não tem ingredientes vinculados.
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
                  unitCost={stockItem?.unitCost ?? 0}
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
            <p className="text-foreground text-sm font-semibold">
              Adicionar ingrediente
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">
                Insumo do estoque
              </span>
              <select
                {...register("stockItemId", { valueAsNumber: true })}
                className={fieldClassName}
              >
                <option value={0}>Selecione</option>
                {availableStockItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({formatBRL(item.unitCost)}/{item.unit})
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
                Quantidade por lanche
              </span>
              <input
                type="number"
                min={1}
                {...register("quantity", { valueAsNumber: true })}
                className={fieldClassName}
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
              {addComposition.isPending
                ? "Adicionando..."
                : "Adicionar à receita"}
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
  unitCost,
  pending,
  onSave,
  onRemove,
}: {
  item: ProductComposition;
  name: string;
  unit: string;
  unitCost: number;
  pending: boolean;
  onSave: (quantity: number) => Promise<unknown>;
  onRemove: () => void;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const dirty = quantity !== item.quantity;

  return (
    <li className="border-border flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-foreground truncate text-sm font-semibold">
            {name}
          </p>
          <span className="text-muted-foreground tabular text-xs">
            {formatBRL(quantity * unitCost)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="border-input bg-background focus:border-primary focus:ring-primary/15 tabular h-8 w-20 rounded-lg border px-2 text-sm font-medium outline-none focus:ring-4"
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
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remover ${name}`}
          disabled={pending}
          onClick={onRemove}
          className="hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}
