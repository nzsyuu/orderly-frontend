import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersRepository } from "@/modules/orders/api";
import { isActiveOrder } from "@/modules/orders/lib/order-status";
import type { Order } from "@/modules/orders/types/order";

export const ordersRootKey = ["orders"] as const;
export const myOrdersQueryKey = ["orders", "me"] as const;
export const orderQueryKey = (id: string) => ["orders", id] as const;

const LIST_POLL_MS = 20_000;
const DETAIL_POLL_MS = 7_000;

export function useMyOrders(enabled = true) {
  return useQuery({
    queryKey: myOrdersQueryKey,
    queryFn: () => ordersRepository.listMine(),
    enabled,
    retry: false,
    // Para sozinho quando não há pedido em andamento; pausa com a aba em segundo plano.
    refetchInterval: (query) =>
      query.state.data?.some((order) => isActiveOrder(order.status))
        ? LIST_POLL_MS
        : false,
  });
}

export function useOrder(saleId: string) {
  return useQuery({
    queryKey: orderQueryKey(saleId),
    queryFn: () => ordersRepository.getById(saleId),
    retry: 1,
    refetchInterval: (query) =>
      query.state.data && !isActiveOrder(query.state.data.status)
        ? false
        : DETAIL_POLL_MS,
  });
}

export function useActiveOrders(enabled: boolean) {
  const orders = useMyOrders(enabled);
  return {
    ...orders,
    activeOrders: (orders.data ?? []).filter((order) =>
      isActiveOrder(order.status),
    ),
  };
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleId: string) => ordersRepository.cancel(saleId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ordersRootKey });
    },
  });
}

export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleId: string) => ordersRepository.confirmDelivery(saleId),
    onSuccess: (_, saleId) => {
      // ENTREGUE deixa de ser ativo: o polling para na hora.
      queryClient.setQueryData<Order>(orderQueryKey(saleId), (old) =>
        old ? { ...old, status: "ENTREGUE" } : old,
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ordersRootKey });
    },
  });
}
