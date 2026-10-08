import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salesRepository } from "@/modules/sales/api";
import type { SalesListFilters } from "@/modules/sales/api/repository";

export const salesQueryKey = ["sales"] as const;

export function useSales(filters?: SalesListFilters, queryOptions?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: [...salesQueryKey, filters],
    queryFn: () => salesRepository.list(filters),
    ...queryOptions,
  });
}

export function useConfirmSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saleId: string) => salesRepository.confirm(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesQueryKey });
    },
  });
}

export function useDispatchSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saleId: string) => salesRepository.dispatch(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesQueryKey });
    },
  });
}

export function useDeliverSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saleId: string) => salesRepository.deliver(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesQueryKey });
    },
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saleId: string) => salesRepository.cancel(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesQueryKey });
    },
  });
}
