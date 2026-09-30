import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAddressInput,
  UpdateAddressInput,
  ViaCepResult,
} from "@/modules/address/types/address";
import { addressRepository } from "@/modules/address/api";
import axios from "axios";

export const addressQueryKey = ["addresses"] as const;

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: addressQueryKey,
    queryFn: () => addressRepository.list(),
    enabled,
    retry: false,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAddressInput) => addressRepository.create(input),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: addressQueryKey });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      input,
    }: {
      addressId: string;
      input: UpdateAddressInput;
    }) => addressRepository.update(addressId, input),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: addressQueryKey });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => addressRepository.remove(addressId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: addressQueryKey });
    },
  });
}

export function useLookupCep() {
  return useMutation({
    mutationFn: async (cep: string): Promise<ViaCepResult> => {
      const cleaned = cep.replace(/\D/g, "");
      const { data } = await axios.get<ViaCepResult>(
        `https://viacep.com.br/ws/${cleaned}/json/`,
      );
      if (data.erro) {
        throw new Error("CEP não encontrado.");
      }
      return data;
    },
  });
}
