import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CheckoutInput } from "@/modules/checkout/types/checkout";
import { checkoutRepository } from "@/modules/checkout/api";
import { cartQueryKey } from "@/modules/cart/hooks/use-cart";
import {
  orderQueryKey,
  ordersRootKey,
} from "@/modules/orders/hooks/use-orders";

export function useFreight(addressId: string | null) {
  return useQuery({
    queryKey: ["freight", addressId],
    queryFn: () => checkoutRepository.getFreight(addressId!),
    enabled: !!addressId,
    retry: false,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CheckoutInput) => checkoutRepository.checkout(input),
    onSuccess: (sale) => {
      // A página de acompanhamento abre sem loading e o badge do carrinho zera.
      queryClient.setQueryData(orderQueryKey(sale.saleId), sale);
      void queryClient.invalidateQueries({ queryKey: cartQueryKey });
      void queryClient.invalidateQueries({ queryKey: ordersRootKey });
    },
  });
}
