"use client";

import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import {
  useCreateProduct,
  useUploadProductImage,
} from "@/modules/products/hooks/use-products";
import {
  createProductFormSchema,
  type CreateProductFormValues,
} from "@/modules/products/schemas/product-form";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { fieldClassName, Modal } from "@/shared/ui/modal";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

type CreateProductDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateProductDialog({
  open,
  onClose,
}: CreateProductDialogProps) {
  const createProduct = useCreateProduct();
  const uploadImage = useUploadProductImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

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

  const isSubmitting = uploadImage.isPending || createProduct.isPending;

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
  }

  function removeImage() {
    imageFileRef.current = null;
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    reset();
    removeImage();
    uploadImage.reset();
    createProduct.reset();
    onClose();
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  const onSubmit = useCallback(
    async (values: CreateProductFormValues) => {
      try {
        // Passo 1: Upload da imagem (se houver)
        let imageUrl: string | null = null;
        if (imageFileRef.current) {
          const result = await uploadImage.mutateAsync(imageFileRef.current);
          imageUrl = result.imageUrl;
        }

        // Passo 2: Criar o produto com o imageUrl
        await createProduct.mutateAsync({
          name: values.name,
          description: values.description || null,
          price: values.price,
          imageUrl,
          active: true,
        });
        handleClose();
      } catch {
        // A mensagem de erro já aparece abaixo do formulário.
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploadImage, createProduct],
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
      open={open}
      title="Novo produto"
      subtitle="Cadastre um item do cardápio. A receita pode ser montada depois."
      onClose={handleClose}
    >
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={onFormSubmit}
      >
        {/* Upload de Imagem */}
        <div className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">
            Imagem do produto
          </span>
          {imagePreview ? (
            <div className="relative h-40 w-full overflow-hidden rounded-lg border border-input">
              <Image
                src={imagePreview}
                alt="Prévia da imagem"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openFilePicker}
              className="border-input bg-background hover:bg-accent/50 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors"
            >
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                <Upload className="text-muted-foreground h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-foreground text-sm font-medium">
                  Clique para enviar uma imagem
                </p>
                <p className="text-muted-foreground text-xs">
                  PNG, JPG ou WEBP (máx. 2 MB)
                </p>
              </div>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {imageError && (
            <span className="text-destructive text-xs">{imageError}</span>
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

        {(uploadImage.isError || createProduct.isError) && (
          <p className="text-destructive text-sm">
            {uploadImage.isError
              ? getApiErrorMessage(
                  uploadImage.error,
                  "Não foi possível enviar a imagem.",
                )
              : getApiErrorMessage(
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
          <Button type="submit" disabled={isSubmitting}>
            {uploadImage.isPending
              ? "Enviando imagem..."
              : createProduct.isPending
                ? "Salvando..."
                : "Criar produto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
