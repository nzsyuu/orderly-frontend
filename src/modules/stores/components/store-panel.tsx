"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import {
  useClearStoreManualStatus,
  useSetStoreStatus,
  useStore,
  useUpdateStoreSettings,
} from "@/modules/stores/hooks/use-stores";
import { StoreStatusBadge } from "@/modules/stores/components/store-status-badge";
import {
  storeSettingsFormSchema,
  type StoreSettingsFormValues,
} from "@/modules/stores/schemas/store-form";
import {
  formatStoreHours,
  toApiTime,
  toTimeInputValue,
} from "@/modules/stores/lib/time";
import type { Store, StoreStatus } from "@/modules/stores/types/store";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { fieldClassName } from "@/shared/ui/modal";

const statusActions: { status: StoreStatus; label: string }[] = [
  { status: "ABERTA", label: "Abrir" },
  { status: "PAUSADA", label: "Pausar" },
  { status: "FECHADA", label: "Fechar" },
];

export function StorePanel() {
  const query = useStore();

  if (query.isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Skeleton className="h-72 rounded-md" />
        <Skeleton className="h-72 rounded-md" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="border-border bg-card flex flex-col items-center gap-1 rounded-md border py-16 text-center">
        <p className="text-foreground font-medium">
          Não foi possível carregar a loja
        </p>
        <p className="text-muted-foreground text-sm">
          {getApiErrorMessage(query.error, "Tente novamente em instantes.")}
        </p>
        <Button
          className="mt-3"
          variant="outline"
          onClick={() => query.refetch()}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  const store = query.data;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <StatusCard store={store} />
      <SettingsCard store={store} />
    </div>
  );
}

function StatusCard({ store }: { store: Store }) {
  const setStatus = useSetStoreStatus();
  const clearManual = useClearStoreManualStatus();
  const isManual = store.manualStatus != null;
  const busy = setStatus.isPending || clearManual.isPending;

  return (
    <section className="border-border bg-card flex flex-col gap-5 rounded-md border p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-foreground text-2xl leading-tight font-bold tracking-tight">
          {store.name}
        </h2>
        <p className="text-muted-foreground flex items-start gap-1.5 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            {store.addressStreet}, {store.addressNumber}.{" "}
            {store.addressNeighborhood}, {store.addressCity}. CEP{" "}
            {store.addressZipCode}
          </span>
        </p>
      </div>

      <div className="border-border flex items-center justify-between gap-3 border-y py-4">
        <div>
          <p className="text-muted-foreground text-xs">Agora</p>
          <p className="text-foreground text-sm font-medium">
            {formatStoreHours(store.openingTime, store.closingTime)}
          </p>
        </div>
        <StoreStatusBadge store={store} />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          {isManual
            ? "Você definiu o status manualmente. Horário e fila de pedidos não o alteram até você voltar ao automático."
            : "O status segue o horário e a fila de pedidos pendentes. O servidor recalcula a cada minuto."}{" "}
          Pedidos só são aceitos quando a loja está aberta.
        </p>
        <div className="flex flex-wrap gap-2">
          {statusActions.map((action) => (
            <Button
              key={action.status}
              type="button"
              variant="outline"
              disabled={busy || store.manualStatus === action.status}
              className="bg-transparent"
              onClick={() => setStatus.mutate(action.status)}
            >
              {action.label}
            </Button>
          ))}
          {isManual ? (
            <Button
              type="button"
              disabled={busy}
              onClick={() => clearManual.mutate()}
            >
              {clearManual.isPending ? "Voltando..." : "Voltar ao automático"}
            </Button>
          ) : null}
        </div>
        {setStatus.isError ? (
          <p className="text-destructive text-sm" role="alert">
            {getApiErrorMessage(
              setStatus.error,
              "Não foi possível alterar o status.",
            )}
          </p>
        ) : null}
        {clearManual.isError ? (
          <p className="text-destructive text-sm" role="alert">
            {getApiErrorMessage(
              clearManual.error,
              "Não foi possível voltar ao automático.",
            )}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function SettingsCard({ store }: { store: Store }) {
  const updateSettings = useUpdateStoreSettings();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsFormSchema),
    defaultValues: {
      openingTime: toTimeInputValue(store.openingTime),
      closingTime: toTimeInputValue(store.closingTime),
      maxOrdersInProgress: store.maxOrdersInProgress,
      automaticPause: store.automaticPause,
    },
  });

  useEffect(() => {
    reset({
      openingTime: toTimeInputValue(store.openingTime),
      closingTime: toTimeInputValue(store.closingTime),
      maxOrdersInProgress: store.maxOrdersInProgress,
      automaticPause: store.automaticPause,
    });
  }, [store, reset]);

  return (
    <section className="border-border bg-card rounded-md border p-5">
      <h2 className="font-display text-foreground text-lg font-bold tracking-tight">
        Funcionamento
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Horário de atendimento e quantos pedidos a cozinha aguenta ao mesmo
        tempo.
      </p>
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await updateSettings.mutateAsync({
              openingTime: toApiTime(values.openingTime),
              closingTime: toApiTime(values.closingTime),
              maxOrdersInProgress: values.maxOrdersInProgress,
              automaticPause: values.automaticPause,
            });
          } catch {
            // O erro aparece abaixo do formulário.
          }
        })}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">Abre às</span>
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
              Fecha às
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
            Pedidos em andamento ao mesmo tempo
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
            Pausar a loja quando atingir esse limite
          </span>
        </label>

        {updateSettings.isError ? (
          <p className="text-destructive text-sm" role="alert">
            {getApiErrorMessage(
              updateSettings.error,
              "Não foi possível salvar o funcionamento.",
            )}
          </p>
        ) : null}
        {updateSettings.isSuccess && !isDirty ? (
          <p className="text-success text-sm" role="status">
            Funcionamento salvo.
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={updateSettings.isPending || !isDirty}>
            {updateSettings.isPending ? "Salvando..." : "Salvar funcionamento"}
          </Button>
        </div>
      </form>
    </section>
  );
}
