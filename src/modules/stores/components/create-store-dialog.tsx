"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateStore } from "@/modules/stores/hooks/use-stores";
import {
  createStoreFormSchema,
  type CreateStoreFormValues,
} from "@/modules/stores/schemas/store-form";
import { toApiTime } from "@/modules/stores/lib/time";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { fieldClassName, Modal } from "@/shared/ui/modal";

type CreateStoreDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateStoreDialog({ open, onClose }: CreateStoreDialogProps) {
  const createStore = useCreateStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStoreFormValues>({
    resolver: zodResolver(createStoreFormSchema),
    defaultValues: {
      name: "",
      openingTime: "08:00",
      closingTime: "22:00",
      maxOrdersInProgress: 40,
      automaticPause: true,
      addressStreet: "",
      addressNumber: "",
      addressNeighborhood: "",
      addressCity: "",
      addressZipCode: "",
    },
  });

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      wide
      title="Nova loja"
      subtitle="Nome e endereço não poderão ser alterados depois. O status inicial é calculado pelo horário do servidor."
      onClose={handleClose}
    >
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await createStore.mutateAsync({
              name: values.name,
              openingTime: toApiTime(values.openingTime),
              closingTime: toApiTime(values.closingTime),
              maxOrdersInProgress: values.maxOrdersInProgress,
              automaticPause: values.automaticPause,
              addressStreet: values.addressStreet,
              addressNumber: values.addressNumber,
              addressNeighborhood: values.addressNeighborhood,
              addressCity: values.addressCity,
              addressZipCode: values.addressZipCode,
            });
            handleClose();
          } catch {
            // A mensagem de erro já aparece abaixo do formulário.
          }
        })}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Nome</span>
          <input
            {...register("name")}
            maxLength={120}
            className={fieldClassName}
            placeholder="Ex.: Orderly Tirol"
          />
          {errors.name ? (
            <span className="text-destructive text-xs">
              {errors.name.message}
            </span>
          ) : null}
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">Abertura</span>
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
        <p className="text-muted-foreground -mt-2 text-xs">
          Horário de fechamento pode ser menor que o de abertura (vira a noite)
          ou igual (24 horas).
        </p>

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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-foreground text-sm font-medium">
              Logradouro
            </span>
            <input
              {...register("addressStreet")}
              className={fieldClassName}
              placeholder="Av. Senador Salgado Filho"
            />
            {errors.addressStreet ? (
              <span className="text-destructive text-xs">
                {errors.addressStreet.message}
              </span>
            ) : null}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">Número</span>
            <input
              {...register("addressNumber")}
              inputMode="numeric"
              className={fieldClassName}
              placeholder="2234"
            />
            {errors.addressNumber ? (
              <span className="text-destructive text-xs">
                {errors.addressNumber.message}
              </span>
            ) : null}
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">Bairro</span>
            <input
              {...register("addressNeighborhood")}
              className={fieldClassName}
            />
            {errors.addressNeighborhood ? (
              <span className="text-destructive text-xs">
                {errors.addressNeighborhood.message}
              </span>
            ) : null}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">Cidade</span>
            <input {...register("addressCity")} className={fieldClassName} />
            {errors.addressCity ? (
              <span className="text-destructive text-xs">
                {errors.addressCity.message}
              </span>
            ) : null}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">CEP</span>
            <input
              {...register("addressZipCode")}
              className={fieldClassName}
              placeholder="59064-900"
            />
            {errors.addressZipCode ? (
              <span className="text-destructive text-xs">
                {errors.addressZipCode.message}
              </span>
            ) : null}
          </label>
        </div>

        {createStore.isError ? (
          <p className="text-destructive text-sm">
            {getApiErrorMessage(
              createStore.error,
              "Não foi possível cadastrar a loja.",
            )}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="bg-transparent"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={createStore.isPending}>
            {createStore.isPending ? "Cadastrando..." : "Cadastrar loja"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
