import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateStockInput,
  CreateStockItemInput,
  RegisterMovementInput,
  UpdateStockItemInput,
} from "@/modules/inventory/types/stock-item";
import { inventoryRepository } from "@/modules/inventory/api";
import { productsQueryKey } from "@/modules/products/hooks/use-products";

export const stocksQueryKey = ["stocks"] as const;
export const stockItemsQueryKey = ["stock-items"] as const;

export function stockItemsByStockQueryKey(stockId: number) {
  return ["stock-items", stockId] as const;
}

export function stockLotsQueryKey(stockItemId: number) {
  return ["stock-items", stockItemId, "lots"] as const;
}

export function useStocks() {
  return useQuery({
    queryKey: stocksQueryKey,
    queryFn: () => inventoryRepository.listStocks(),
  });
}

export function useStockItems() {
  return useQuery({
    queryKey: stockItemsQueryKey,
    queryFn: () => inventoryRepository.list(),
  });
}

export function useStockItemsByStock(stockId: number | null) {
  return useQuery({
    queryKey:
      stockId === null
        ? ["stock-items", "empty"]
        : stockItemsByStockQueryKey(stockId),
    queryFn: () => inventoryRepository.listByStock(stockId as number),
    enabled: stockId !== null,
  });
}

export function useStockLots(stockItemId: number | null) {
  return useQuery({
    queryKey:
      stockItemId === null
        ? ["stock-items", "empty", "lots"]
        : stockLotsQueryKey(stockItemId),
    queryFn: () => inventoryRepository.listLots(stockItemId as number),
    enabled: stockItemId !== null,
  });
}

export function useCreateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStockInput) =>
      inventoryRepository.createStock(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stocksQueryKey });
    },
  });
}

export function useCreateStockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stockId,
      input,
    }: {
      stockId: number;
      input: CreateStockItemInput;
    }) => inventoryRepository.create(stockId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockItemsQueryKey });
      void queryClient.invalidateQueries({ queryKey: stocksQueryKey });
    },
  });
}

export function useUpdateStockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateStockItemInput }) =>
      inventoryRepository.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockItemsQueryKey });
    },
  });
}

export function useDeleteStockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inventoryRepository.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockItemsQueryKey });
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useRegisterMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: RegisterMovementInput }) =>
      inventoryRepository.registerMovement(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: stockItemsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: stockLotsQueryKey(variables.id),
      });
    },
  });
}
