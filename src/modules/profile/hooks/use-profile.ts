import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { sessionQueryKey } from "@/modules/auth/hooks/use-auth";
import { profileRepository } from "@/modules/profile/api";

export function useUpdateName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => profileRepository.updateName(name),
    onSuccess: (user) => {
      // Atualiza na hora o header e o avatar.
      queryClient.setQueryData(sessionQueryKey, user);
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      profileRepository.updatePassword(input),
    onSuccess: (user) => {
      queryClient.setQueryData(sessionQueryKey, user);
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (password: string) => profileRepository.deleteAccount(password),
    onSuccess: () => {
      queryClient.clear();
      localStorage.removeItem("activeAddressId");
      router.replace("/login");
    },
  });
}
