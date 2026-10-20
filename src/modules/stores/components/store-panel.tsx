"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, MapPin, RotateCcw, Store as StoreIcon } from "lucide-react";
import { StoreStatusBadge } from "@/modules/stores/components/store-status-badge";
import {
  useClearStoreManualStatus,
  useSetStoreStatus,
  useStore,
  useUpdateStoreSettings,
} from "@/modules/stores/hooks/use-stores";
import {
  formatStoreHours,
  toApiTime,
  toTimeInputValue,
} from "@/modules/stores/lib/time";
import {
  storeSettingsFormSchema,
  type StoreSettingsFormValues,
} from "@/modules/stores/schemas/store-form";
import type { Store, StoreStatus } from "@/modules/stores/types/store";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { fieldClassName } from "@/shared/ui/modal";
import { EmptyState, PageHeader, Panel } from "@/shared/ui/page";
import { Skeleton } from "@/shared/ui/skeleton";

const statusActions: {
  status: StoreStatus;
  label: string;
  helper: string;
}[] = [
  {
    status: "ABERTA",
    label: "Abrir",
    helper: "Recebendo pedidos",
  },
  {
    status: "PAUSADA",
    label: "Pausar",
    helper: "Segura novos pedidos",
  },
  {
    status: "FECHADA",
    label: "Fechar",
    helper: "Encerra o atendimento",
  },
];

export function StorePanel() {
  const query = useStore();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Operação da loja"
        description="Defina o horário de atendimento, a capacidade da cozinha e o status em tempo real do cardápio."
      />

      {query.isPending ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-80 rounded-2xl lg:col-span-5" />
          <Skeleton className="h-80 rounded-2xl lg:col-span-7" />
        </div>
      ) : query.isError ? (
        <Panel>
          <EmptyState
            icon={StoreIcon}
            title="Não foi possível carregar a loja"
            description={getApiErrorMessage(
              query.error,
              "Tente novamente em instantes.",
            )}
            action={
              <Button variant="outline" onClick={() => query.refetch()}>
                Tentar de novo
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-12">
          <StatusCard store={query.data} />
          <SettingsCard store={query.data} />
        </div>
      )}
    </div>
  );
}

function StatusCard({ store }: { store: Store }) {
  const setStatus = useSetStoreStatus();
  const clearManual = useClearStoreManualStatus();
  const isManual = store.manualStatus != null;
  const busy = setStatus.isPending || clearManual.isPending;

  return (
    <section className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-5 sm:p-6 lg:col-span-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-condensed text-foreground text-2xl leading-tight font-extrabold">
            {store.name}
          </h2>
          <p className="text-muted-foreground mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              {store.addressStreet}, {store.addressNumber} ·{" "}
              {store.addressNeighborhood}, {store.addressCity} · CEP{" "}
              {store.addressZipCode}
            </span>
          </p>
        </div>
        <StoreStatusBadge store={store} />
      </div>

      <div className="border-border bg-muted/50 flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Clock className="text-muted-foreground size-4" aria-hidden />
          <div>
            <p className="text-muted-foreground text-[11px]">
              Horário programado
            </p>
            <p className="text-foreground tabular text-sm font-semibold">
              {formatStoreHours(store.openingTime, store.closingTime)}
            </p>
          </div>
        </div>
        <span className="text-muted-foreground text-xs font-medium">
          {isManual ? "Modo manual" : "Modo automático"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          {isManual
            ? "Você fixou o status manualmente. O horário e a fila não o alteram até você voltar ao modo automático."
            : "O status acompanha o horário e a fila da cozinha automaticamente a cada minuto."}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {statusActions.map((action) => {
            const isSelected = store.manualStatus === action.status;
            return (
              <button
                key={action.status}
                type="button"
                disabled={busy || isSelected}
                onClick={() => setStatus.mutate(action.status)}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-3 text-left transition-colors disabled:opacity-60",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card hover:bg-muted text-foreground",
                )}
              >
                <span className="text-sm font-bold">{action.label}</span>
                <span
                  className={cn(
                    "mt-0.5 text-[11px]",
                    isSelected
                      ? "text-primary-foreground/75"
                      : "text-muted-foreground",
                  )}
                >
                  {action.helper}
                </span>
              </button>
            );
          })}
        </div>

        {isManual ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => clearManual.mutate()}
          >
            <RotateCcw className="size-4" />
            {clearManual.isPending ? "Voltando..." : "Voltar ao automático"}
          </Button>
        ) : null}

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
    <Panel
      title="Regras de funcionamento"
      description="Defina quando a loja abre e quantos pedidos simultâneos a cozinha comporta."
      className="lg:col-span-7"
    >
      <form
        className="flex flex-col gap-4"
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
            Limite de pedidos simultâneos na cozinha
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

        <label className="border-border bg-muted/40 flex cursor-pointer items-center gap-3 rounded-xl border p-3.5">
          <input
            type="checkbox"
            {...register("automaticPause")}
            className="size-4 shrink-0"
          />
          <div>
            <span className="text-foreground block text-sm font-semibold">
              Pausa automática de segurança
            </span>
            <span className="text-muted-foreground block text-xs">
              Pausa novos pedidos no cardápio assim que a fila atingir o limite
              acima.
            </span>
          </div>
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
          <p className="text-success text-sm font-medium" role="status">
            Funcionamento salvo.
          </p>
        ) : null}

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={updateSettings.isPending || !isDirty}>
            {updateSettings.isPending ? "Salvando..." : "Salvar funcionamento"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
