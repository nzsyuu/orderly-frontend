"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import {
  useUpdateProduct,
  useReplaceProductImage,
} from "@/modules/products/hooks/use-products";
import type { Product } from "@/modules/products/types/product";
import {
  updateProductFormSchema,
  type UpdateProductFormValues,
} from "@/modules/products/schemas/product-form";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { fieldClassName, Modal } from "@/shared/ui/modal";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

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
  const replaceImage = useReplaceProductImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewProductId, setPreviewProductId] = useState<number | null>(null);

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
    imageFileRef.current = null;
  }, [product, reset]);

  // Discard stale preview/error when the product changes
  const activePreview =
    product && previewProductId === product.id ? imagePreview : null;
  const activeError =
    product && previewProductId === product.id ? imageError : null;

  const currentProductImage = product?.imageUrl ?? null;
  const isSubmitting = updateProduct.isPending || replaceImage.isPending;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImageError(null);

    if (!file) {
      imageFileRef.current = null;
      setImagePreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError("A imagem deve ter no máximo 2 MB.");
      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("Selecione um arquivo de imagem válido.");
      event.target.value = "";
      return;
    }

    imageFileRef.current = file;
    setImagePreview(URL.createObjectURL(file));
    setPreviewProductId(product?.id ?? null);
  }

  function removeNewImage() {
    imageFileRef.current = null;
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    reset();
    removeNewImage();
    updateProduct.reset();
    replaceImage.reset();
    onClose();
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  // Current image to show: new preview > existing product image
  const displayImage = activePreview ?? currentProductImage;

  const onSubmit = useCallback(
    async (values: UpdateProductFormValues) => {
      if (!product) return;
      try {
        // Se trocou a imagem, usa a rota expressa PUT /api/products/{id}/image
        if (imageFileRef.current) {
          await replaceImage.mutateAsync({
            productId: product.id,
            file: imageFileRef.current,
          });
        }

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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, replaceImage, updateProduct, onSaved],
  );

  const onFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void handleSubmit(onSubmit)(event);
    },
    [handleSubmit, onSubmit],
  );

  return (
    <Modal
      open={product !== null}
      title="Editar produto"
      subtitle="Atualiza nome, descrição, preço e disponibilidade."
      onClose={handleClose}
    >
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={onFormSubmit}
      >
        {/* Imagem do produto */}
        <div className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">
            Imagem do produto
          </span>
          {displayImage ? (
            <div className="relative h-40 w-full overflow-hidden rounded-lg border border-input">
              <Image
                src={displayImage}
                alt="Imagem do produto"
                fill
                className="object-cover"
                unoptimized={activePreview !== null}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="flex h-7 items-center gap-1 rounded-full bg-black/50 px-2.5 text-xs text-white hover:bg-black/70 transition-colors"
                >
                  <Upload className="h-3 w-3" />
                  Trocar
                </button>
                {activePreview && (
                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openFilePicker}
              className="border-input bg-background hover:bg-accent/50 flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors"
            >
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                <Upload className="text-muted-foreground h-5 w-5" />
              </div>
              <p className="text-muted-foreground text-xs">
                Clique para adicionar uma imagem (máx. 2 MB)
              </p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {activeError && (
            <span className="text-destructive text-xs">{activeError}</span>
          )}
        </div>

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

        {(updateProduct.isError || replaceImage.isError) && (
          <p className="text-destructive text-sm">
            {replaceImage.isError
              ? getApiErrorMessage(
                  replaceImage.error,
                  "Não foi possível atualizar a imagem.",
                )
              : getApiErrorMessage(
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
          <Button type="submit" disabled={isSubmitting}>
            {replaceImage.isPending
              ? "Atualizando imagem..."
              : updateProduct.isPending
                ? "Salvando..."
                : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
