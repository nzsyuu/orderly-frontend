"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateProduct } from "@/modules/products/hooks/use-products";
import type { Product } from "@/modules/products/types/product";
import {
  updateProductFormSchema,
  type UpdateProductFormValues,
} from "@/modules/products/schemas/product-form";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { fieldClassName, Modal } from "@/shared/ui/modal";

type EditProductDialogProps = {
  product: Product | null;
  onClose: () => void;
  onSaved?: (product: Product) => void;
};

export function EditProductDialog({
  product,
  onClose,
  onSaved,
}: EditProductDialogProps) {
  const updateProduct = useUpdateProduct();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (!product) return;
    reset({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      active: product.active,
    });
  }, [product, reset]);

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={product !== null}
      title="Editar produto"
      subtitle="Atualiza nome, descrição, preço e disponibilidade."
      onClose={handleClose}
    >
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          if (!product) return;
          try {
            const saved = await updateProduct.mutateAsync({
              id: product.id,
              input: {
                name: values.name,
                description: values.description || null,
                price: values.price,
                active: values.active,
              },
            });
            onSaved?.(saved);
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

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("active")} className="size-4" />
          <span className="text-foreground text-sm">Produto ativo</span>
        </label>

        {updateProduct.isError && (
          <p className="text-destructive text-sm">
            {getApiErrorMessage(
              updateProduct.error,
              "Não foi possível atualizar o produto.",
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
          <Button type="submit" disabled={updateProduct.isPending}>
            {updateProduct.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
