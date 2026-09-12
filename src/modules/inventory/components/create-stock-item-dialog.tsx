"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateStock,
  useCreateStockItem,
  useStocks,
} from "@/modules/inventory/hooks/use-stock-items";
import {
  createStockItemFormSchema,
  stockCategoryOptions,
  STOCK_UNITS,
  type CreateStockItemFormValues,
} from "@/modules/inventory/schemas/stock-item-form";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { fieldClassName, Modal } from "@/shared/ui/modal";

const NEW_STOCK_VALUE = "__new__";

type CreateStockItemDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateStockItemDialog({
  open,
  onClose,
}: CreateStockItemDialogProps) {
  const stocksQuery = useStocks();
  const createStock = useCreateStock();
  const createStockItem = useCreateStockItem();
  const stocks = useMemo(() => stocksQuery.data ?? [], [stocksQuery.data]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateStockItemFormValues>({
    resolver: zodResolver(createStockItemFormSchema),
    defaultValues: {
      stockId: NEW_STOCK_VALUE,
      newStockName: "Estoque principal",
      name: "",
      category: "",
      unit: "un",
      currentQuantity: 0,
      minimumStock: 0,
      unitCost: 0,
    },
  });

  const selectedStockId = useWatch({ control, name: "stockId" });

  useEffect(() => {
    if (!open) return;
    if (stocks.length === 0) {
      setValue("stockId", NEW_STOCK_VALUE);
      return;
    }
    setValue("stockId", String(stocks[0].id));
  }, [open, setValue, stocks]);

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Novo item de estoque"
      subtitle="Cadastre um insumo. Se ainda não houver depósito, um será criado agora."
      onClose={handleClose}
    >
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            let stockId = Number(values.stockId);
            if (values.stockId === NEW_STOCK_VALUE) {
              const stock = await createStock.mutateAsync({
                name: values.newStockName?.trim() || "Estoque principal",
              });
              stockId = stock.id;
            }

            await createStockItem.mutateAsync({
              stockId,
              input: {
                name: values.name,
                category: values.category,
                unit: values.unit,
                currentQuantity: values.currentQuantity,
                minimumStock: values.minimumStock,
                unitCost: values.unitCost,
                active: true,
              },
            });
            handleClose();
          } catch {
            // A mensagem de erro já aparece abaixo do formulário.
          }
        })}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Depósito</span>
          <select {...register("stockId")} className={fieldClassName}>
            {stocks.map((stock) => (
              <option key={stock.id} value={stock.id}>
                {stock.name}
              </option>
            ))}
            <option value={NEW_STOCK_VALUE}>Criar novo depósito</option>
          </select>
        </label>

        {selectedStockId === NEW_STOCK_VALUE && (
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">
              Nome do depósito
            </span>
            <input
              {...register("newStockName")}
              className={fieldClassName}
              placeholder="Ex.: Cozinha"
            />
            {errors.newStockName && (
              <span className="text-destructive text-xs">
                {errors.newStockName.message}
              </span>
            )}
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Nome</span>
          <input
            {...register("name")}
            className={fieldClassName}
            placeholder="Ex.: Queijo mussarela"
          />
          {errors.name && (
            <span className="text-destructive text-xs">
              {errors.name.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Categoria</span>
          <select {...register("category")} className={fieldClassName}>
            <option value="">Selecione</option>
            {stockCategoryOptions().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="text-destructive text-xs">
              {errors.category.message}
            </span>
          )}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">Unidade</span>
            <select {...register("unit")} className={fieldClassName}>
              {STOCK_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            {errors.unit && (
              <span className="text-destructive text-xs">
                {errors.unit.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">
              Custo unitário
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("unitCost", { valueAsNumber: true })}
              className={fieldClassName}
            />
            {errors.unitCost && (
              <span className="text-destructive text-xs">
                {errors.unitCost.message}
              </span>
            )}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">
              Quantidade atual
            </span>
            <input
              type="number"
              min="0"
              step="1"
              {...register("currentQuantity", { valueAsNumber: true })}
              className={fieldClassName}
            />
            {errors.currentQuantity && (
              <span className="text-destructive text-xs">
                {errors.currentQuantity.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">
              Estoque mínimo
            </span>
            <input
              type="number"
              min="0"
              step="1"
              {...register("minimumStock", { valueAsNumber: true })}
              className={fieldClassName}
            />
            {errors.minimumStock && (
              <span className="text-destructive text-xs">
                {errors.minimumStock.message}
              </span>
            )}
          </label>
        </div>

        {(createStock.isError || createStockItem.isError) && (
          <p className="text-destructive text-sm">
            {getApiErrorMessage(
              createStock.error ?? createStockItem.error,
              "Não foi possível criar o item.",
            )}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createStock.isPending || createStockItem.isPending}
          >
            {createStock.isPending || createStockItem.isPending
              ? "Salvando..."
              : "Criar item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
