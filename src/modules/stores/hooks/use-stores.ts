import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { storeRepository } from "@/modules/stores/api";
import type {
  Store,
  StoreStatus,
  UpdateStoreSettingsInput,
} from "@/modules/stores/types/store";

export const storeQueryKey = ["store"] as const;

/** Dados e status da loja única. Atualiza a cada minuto, como o servidor. */
export function useStore() {
  return useQuery({
    queryKey: storeQueryKey,
    queryFn: () => storeRepository.get(),
    refetchInterval: 60_000,
    retry: false,
  });
}

function useCacheStore() {
  const queryClient = useQueryClient();
  return (store: Store) => queryClient.setQueryData(storeQueryKey, store);
}

export function useUpdateStoreSettings() {
  const cacheStore = useCacheStore();
  return useMutation({
    mutationFn: (input: UpdateStoreSettingsInput) =>
      storeRepository.updateSettings(input),
    onSuccess: cacheStore,
  });
}

export function useSetStoreStatus() {
  const cacheStore = useCacheStore();
  return useMutation({
    mutationFn: (status: StoreStatus) => storeRepository.setStatus(status),
    onSuccess: cacheStore,
  });
}

export function useClearStoreManualStatus() {
  const cacheStore = useCacheStore();
  return useMutation({
    mutationFn: () => storeRepository.clearManualStatus(),
    onSuccess: cacheStore,
  });
}
