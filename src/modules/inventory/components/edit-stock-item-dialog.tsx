"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateStockItem } from "@/modules/inventory/hooks/use-stock-items";
import type { StockItem } from "@/modules/inventory/types/stock-item";
import {
  stockCategoryOptions,
  updateStockItemFormSchema,
  type UpdateStockItemFormValues,
} from "@/modules/inventory/schemas/stock-item-form";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { fieldClassName, Modal } from "@/shared/ui/modal";

type EditStockItemDialogProps = {
  item: StockItem | null;
  onClose: () => void;
};

export function EditStockItemDialog({
  item,
  onClose,
}: EditStockItemDialogProps) {
  const updateStockItem = useUpdateStockItem();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateStockItemFormValues>({
    resolver: zodResolver(updateStockItemFormSchema),
    defaultValues: {
      name: "",
      category: "",
      minimumStock: 0,
      unitCost: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (!item) return;
    reset({
      name: item.name,
      category: item.category,
      minimumStock: item.minimumStock,
      unitCost: item.unitCost,
      active: item.active,
    });
  }, [item, reset]);

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={item !== null}
      title="Editar item de estoque"
      subtitle="Quantidade e unidade só mudam por movimentação."
      onClose={handleClose}
    >
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          if (!item) return;
          try {
            await updateStockItem.mutateAsync({
              id: item.id,
              input: {
                name: values.name,
                category: values.category,
                minimumStock: values.minimumStock,
                unitCost: values.unitCost,
                active: values.active,
              },
            });
            handleClose();
          } catch {
            // A mensagem de erro já aparece abaixo do formulário.
          }
        })}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Nome</span>
          <input {...register("name")} className={fieldClassName} />
          {errors.name && (
            <span className="text-destructive text-xs">
              {errors.name.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Categoria</span>
          <select {...register("category")} className={fieldClassName}>
            {stockCategoryOptions(item?.category).map((category) => (
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

        <p className="text-muted-foreground text-xs">
          Unidade {item?.unit} · quantidade {item?.currentQuantity}
        </p>

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("active")} className="size-4" />
          <span className="text-foreground text-sm">Item ativo</span>
        </label>

        {updateStockItem.isError && (
          <p className="text-destructive text-sm">
            {getApiErrorMessage(
              updateStockItem.error,
              "Não foi possível atualizar o item.",
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
          <Button type="submit" disabled={updateStockItem.isPending}>
            {updateStockItem.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
