"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProduct } from "@/modules/products/hooks/use-products";
import {
  createProductFormSchema,
  type CreateProductFormValues,
} from "@/modules/products/schemas/product-form";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { fieldClassName, Modal } from "@/shared/ui/modal";

type CreateProductDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateProductDialog({
  open,
  onClose,
}: CreateProductDialogProps) {
  const createProduct = useCreateProduct();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
    },
  });

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Novo produto"
      subtitle="Cadastre um item do cardápio. A receita pode ser montada depois."
      onClose={handleClose}
    >
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await createProduct.mutateAsync({
              name: values.name,
              description: values.description || null,
              price: values.price,
              active: true,
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
            className={fieldClassName}
            placeholder="Ex.: X-Salada"
          />
          {errors.name && (
            <span className="text-destructive text-xs">
              {errors.name.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Descrição</span>
          <textarea
            {...register("description")}
            rows={3}
            className="border-input bg-background focus:border-ring focus:ring-ring/30 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            placeholder="Opcional"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Preço</span>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("price", { valueAsNumber: true })}
            className={fieldClassName}
          />
          {errors.price && (
            <span className="text-destructive text-xs">
              {errors.price.message}
            </span>
          )}
        </label>

        {createProduct.isError && (
          <p className="text-destructive text-sm">
            {getApiErrorMessage(
              createProduct.error,
              "Não foi possível criar o produto.",
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
          <Button type="submit" disabled={createProduct.isPending}>
            {createProduct.isPending ? "Salvando..." : "Criar produto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
