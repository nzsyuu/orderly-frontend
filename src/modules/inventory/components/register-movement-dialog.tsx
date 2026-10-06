"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMovement } from "@/modules/inventory/hooks/use-stock-items";
import type { StockItem } from "@/modules/inventory/types/stock-item";
import {
  movementFormSchema,
  type MovementFormValues,
} from "@/modules/inventory/schemas/stock-item-form";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { fieldClassName, Modal } from "@/shared/ui/modal";

type RegisterMovementDialogProps = {
  item: StockItem;
  onClose: () => void;
};

const typeLabels: Record<MovementFormValues["type"], string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  PERDA: "Perda",
};

export function RegisterMovementDialog({
  item,
  onClose,
}: RegisterMovementDialogProps) {
  const registerMovement = useRegisterMovement();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MovementFormValues>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      type: "ENTRADA",
      quantity: 1,
      reason: "",
      expiresAt: "",
    },
  });

  const type = useWatch({ control, name: "type" });

  function handleClose() {
    setSubmitError(null);
    reset({
      type: "ENTRADA",
      quantity: 1,
      reason: "",
      expiresAt: "",
    });
    onClose();
  }

  return (
    <Modal
      open
      title="Registrar movimentação"
      subtitle={item.name}
      onClose={handleClose}
    >
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          setSubmitError(null);
          try {
            await registerMovement.mutateAsync({
              id: item.id,
              input: {
                type: values.type,
                quantity: values.quantity,
                reason: values.reason,
                expiresAt:
                  values.type === "ENTRADA" ? values.expiresAt : undefined,
              },
            });
            handleClose();
          } catch (error) {
            setSubmitError(
              getApiErrorMessage(
                error,
                "Não foi possível registrar a movimentação.",
              ),
            );
          }
        })}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Tipo</span>
          <select className={fieldClassName} {...register("type")}>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">
            Quantidade ({item.unit})
          </span>
          <input
            type="number"
            min={1}
            step={1}
            className={fieldClassName}
            {...register("quantity", { valueAsNumber: true })}
          />
          {errors.quantity ? (
            <span className="text-destructive text-xs">
              {errors.quantity.message}
            </span>
          ) : null}
        </label>

        {type === "ENTRADA" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">
              Data de validade
            </span>
            <input
              type="date"
              className={fieldClassName}
              {...register("expiresAt")}
            />
            {errors.expiresAt ? (
              <span className="text-destructive text-xs">
                {errors.expiresAt.message}
              </span>
            ) : (
              <span className="text-muted-foreground text-xs">
                Obrigatória na entrada. A saída usa o lote que vence primeiro.
              </span>
            )}
          </label>
        ) : (
          <p className="text-muted-foreground text-xs">
            O sistema baixa automaticamente o lote que vence primeiro (FEFO).
          </p>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Motivo</span>
          <input
            type="text"
            className={fieldClassName}
            placeholder="Ex.: compra do fornecedor"
            {...register("reason")}
          />
          {errors.reason ? (
            <span className="text-destructive text-xs">
              {errors.reason.message}
            </span>
          ) : null}
        </label>

        {submitError ? (
          <p className="text-destructive text-sm">{submitError}</p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={registerMovement.isPending}>
            {registerMovement.isPending ? "Salvando..." : "Registrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
