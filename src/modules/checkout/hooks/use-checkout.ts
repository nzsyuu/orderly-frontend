import { useMutation, useQuery } from "@tanstack/react-query";
import type { CheckoutInput } from "@/modules/checkout/types/checkout";
import { checkoutRepository } from "@/modules/checkout/api";

export function useFreight(addressId: string | null) {
  return useQuery({
    queryKey: ["freight", addressId],
    queryFn: () => checkoutRepository.getFreight(addressId!),
    enabled: !!addressId,
    retry: false,
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: (input: CheckoutInput) => checkoutRepository.checkout(input),
  });
}
