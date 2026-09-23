import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddItemInput,
  UpdateItemQuantityInput,
} from "@/modules/cart/types/cart";
import { cartRepository } from "@/modules/cart/api";

export const cartQueryKey = ["cart"] as const;

export function useCart(enabled = true) {
  return useQuery({
    queryKey: cartQueryKey,
    queryFn: () => cartRepository.get(),
    enabled,
    retry: false,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddItemInput) => cartRepository.addItem(input),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      input,
    }: {
      productId: number;
      input: UpdateItemQuantityInput;
    }) => cartRepository.updateItemQuantity(productId, input),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => cartRepository.removeItem(productId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartRepository.clear(),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
}
