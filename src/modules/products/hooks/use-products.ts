import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddCompositionInput,
  CreateProductInput,
  UpdateCompositionInput,
  UpdateProductInput,
} from "@/modules/products/types/product";
import { productRepository } from "@/modules/products/api";

export const productsQueryKey = ["products"] as const;

export function productQueryKey(id: number) {
  return ["products", id] as const;
}

export function productCompositionsQueryKey(productId: number) {
  return ["products", productId, "compositions"] as const;
}

export function useProducts() {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: () => productRepository.list(),
  });
}

export function useProduct(id: number | null) {
  return useQuery({
    queryKey: id === null ? ["products", "empty"] : productQueryKey(id),
    queryFn: () => productRepository.getById(id as number),
    enabled: id !== null,
  });
}

export function useProductCompositions(productId: number | null) {
  return useQuery({
    queryKey:
      productId === null
        ? ["products", "empty", "compositions"]
        : productCompositionsQueryKey(productId),
    queryFn: () => productRepository.listCompositions(productId as number),
    enabled: productId !== null,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => productRepository.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateProductInput }) =>
      productRepository.update(id, input),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: productQueryKey(product.id),
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productRepository.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useAddComposition(productId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddCompositionInput) => {
      if (productId === null) {
        throw new Error("Produto não selecionado");
      }
      return productRepository.addComposition(productId, input);
    },
    onSuccess: () => {
      if (productId === null) return;
      void queryClient.invalidateQueries({
        queryKey: productCompositionsQueryKey(productId),
      });
    },
  });
}

export function useUpdateComposition(productId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      compositionId,
      input,
    }: {
      compositionId: number;
      input: UpdateCompositionInput;
    }) => {
      if (productId === null) {
        throw new Error("Produto não selecionado");
      }
      return productRepository.updateComposition(
        productId,
        compositionId,
        input,
      );
    },
    onSuccess: () => {
      if (productId === null) return;
      void queryClient.invalidateQueries({
        queryKey: productCompositionsQueryKey(productId),
      });
    },
  });
}

export function useRemoveComposition(productId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (compositionId: number) => {
      if (productId === null) {
        throw new Error("Produto não selecionado");
      }
      return productRepository.removeComposition(productId, compositionId);
    },
    onSuccess: () => {
      if (productId === null) return;
      void queryClient.invalidateQueries({
        queryKey: productCompositionsQueryKey(productId),
      });
    },
  });
}
