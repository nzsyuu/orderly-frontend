"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useClearStoreManualStatus,
  useSetStoreStatus,
  useUpdateStoreSettings,
} from "@/modules/stores/hooks/use-stores";
import { StoreStatusBadge } from "@/modules/stores/components/store-status-badge";
import {
  storeSettingsFormSchema,
  type StoreSettingsFormValues,
} from "@/modules/stores/schemas/store-form";
import { toApiTime, toTimeInputValue } from "@/modules/stores/lib/time";
import type { Store, StoreStatus } from "@/modules/stores/types/store";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { fieldClassName, Modal } from "@/shared/ui/modal";

type StoreDetailDialogProps = {
  store: Store | null;
  onClose: () => void;
};

const statusActions: { status: StoreStatus; label: string }[] = [
  { status: "ABERTA", label: "Abrir" },
  { status: "PAUSADA", label: "Pausar" },
  { status: "FECHADA", label: "Fechar" },
];

export function StoreDetailDialog({ store, onClose }: StoreDetailDialogProps) {
  const updateSettings = useUpdateStoreSettings();
  const setStatus = useSetStoreStatus();
  const clearManual = useClearStoreManualStatus();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsFormSchema),
    defaultValues: {
      openingTime: "08:00",
      closingTime: "22:00",
      maxOrdersInProgress: 1,
      automaticPause: false,
    },
  });

  useEffect(() => {
    if (!store) return;
    reset({
      openingTime: toTimeInputValue(store.openingTime),
      closingTime: toTimeInputValue(store.closingTime),
      maxOrdersInProgress: store.maxOrdersInProgress,
      automaticPause: store.automaticPause,
    });
  }, [store, reset]);

  const isManual = store?.manualStatus != null;
  const statusBusy = setStatus.isPending || clearManual.isPending;

  return (
    <Modal
      open={store !== null}
      wide
      title={store?.name ?? "Loja"}
      subtitle="Identidade é somente leitura. Funcionamento e status usam endpoints separados."
      onClose={onClose}
    >
      {store ? (
        <div className="mt-5 flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h3 className="text-foreground text-sm font-semibold">Identidade</h3>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-xs tracking-wider uppercase">
                  ID
                </dt>
                <dd className="text-foreground mt-0.5 font-medium">{store.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs tracking-wider uppercase">
                  Nome
                </dt>
                <dd className="text-foreground mt-0.5 font-medium">
                  {store.name}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground text-xs tracking-wider uppercase">
                  Endereço
                </dt>
                <dd className="text-foreground mt-0.5">
                  {store.addressStreet}, {store.addressNumber} —{" "}
                  {store.addressNeighborhood}, {store.addressCity} ·{" "}
                  {store.addressZipCode}
                </dd>
              </div>
            </dl>
          </section>

          <section className="border-border flex flex-col gap-3 border-t pt-5">
            <div>
              <h3 className="text-foreground text-sm font-semibold">
                Funcionamento
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Se o status estiver definido manualmente, alterar o horário não
                muda o status até liberar o automático.
              </p>
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(async (values) => {
                try {
                  await updateSettings.mutateAsync({
                    id: store.id,
                    input: {
                      openingTime: toApiTime(values.openingTime),
                      closingTime: toApiTime(values.closingTime),
                      maxOrdersInProgress: values.maxOrdersInProgress,
                      automaticPause: values.automaticPause,
                    },
                  });
                } catch {
                  // A mensagem de erro já aparece abaixo do formulário.
                }
              })}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-foreground text-sm font-medium">
                    Abertura
                  </span>
                  <input
                    type="time"
                    {...register("openingTime")}
                    className={fieldClassName}
                  />
                  {errors.openingTime ? (
                    <span className="text-destructive text-xs">
                      {errors.openingTime.message}
                    </span>
                  ) : null}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-foreground text-sm font-medium">
                    Fechamento
                  </span>
                  <input
                    type="time"
                    {...register("closingTime")}
                    className={fieldClassName}
                  />
                  {errors.closingTime ? (
                    <span className="text-destructive text-xs">
                      {errors.closingTime.message}
                    </span>
                  ) : null}
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-foreground text-sm font-medium">
                  Limite de pedidos em andamento
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  {...register("maxOrdersInProgress", { valueAsNumber: true })}
                  className={fieldClassName}
                />
                {errors.maxOrdersInProgress ? (
                  <span className="text-destructive text-xs">
                    {errors.maxOrdersInProgress.message}
                  </span>
                ) : null}
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("automaticPause")}
                  className="size-4"
                />
                <span className="text-foreground text-sm">
                  Pausar automaticamente ao atingir o limite
                </span>
              </label>

              {updateSettings.isError ? (
                <p className="text-destructive text-sm">
                  {getApiErrorMessage(
                    updateSettings.error,
                    "Não foi possível salvar o funcionamento.",
                  )}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending
                    ? "Salvando..."
                    : "Salvar funcionamento"}
                </Button>
              </div>
            </form>
          </section>

          <section className="border-border flex flex-col gap-3 border-t pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-foreground text-sm font-semibold">Status</h3>
              <StoreStatusBadge store={store} />
            </div>
            <p className="text-muted-foreground text-xs">
              {isManual
                ? "Definido manualmente. O horário e a fila não alteram o status até você voltar ao automático."
                : "Automático: o servidor atualiza a cada cerca de 1 minuto, pelo horário e pela fila de pedidos PENDING."}{" "}
              Vendas só são aceitas com status Aberta.
            </p>
            <div className="flex flex-wrap gap-2">
              {statusActions.map((action) => (
                <Button
                  key={action.status}
                  type="button"
                  variant="outline"
                  disabled={statusBusy || store.manualStatus === action.status}
                  className="bg-transparent"
                  onClick={() =>
                    void setStatus.mutateAsync({
                      id: store.id,
                      status: action.status,
                    })
                  }
                >
                  {action.label}
                </Button>
              ))}
              {isManual ? (
                <Button
                  type="button"
                  disabled={statusBusy}
                  onClick={() => void clearManual.mutateAsync(store.id)}
                >
                  {clearManual.isPending
                    ? "Liberando..."
                    : "Voltar ao automático"}
                </Button>
              ) : null}
            </div>
            {setStatus.isError ? (
              <p className="text-destructive text-sm">
                {getApiErrorMessage(
                  setStatus.error,
                  "Não foi possível alterar o status.",
                )}
              </p>
            ) : null}
            {clearManual.isError ? (
              <p className="text-destructive text-sm">
                {getApiErrorMessage(
                  clearManual.error,
                  "Não foi possível liberar o status automático.",
                )}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
