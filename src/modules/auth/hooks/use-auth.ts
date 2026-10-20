import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  getHomeRouteByRole,
  type LoginInput,
  type RegisterInput,
} from "@/modules/auth/types/user";
import { authRepository } from "@/modules/auth/api";

export const sessionQueryKey = ["session"] as const;

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => authRepository.getProfile(),
    retry: false,
    refetchInterval: 4 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => authRepository.login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(sessionQueryKey, user);
      router.replace(getHomeRouteByRole(user.role));
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) => authRepository.register(input),
    onSuccess: (user) => {
      router.replace(`/verificar?email=${encodeURIComponent(user.email)}`);
    },
  });
}

export function useVerifyAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => authRepository.verify(token),
    onSuccess: (user) => {
      queryClient.setQueryData(sessionQueryKey, user);
      router.replace(getHomeRouteByRole(user.role));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authRepository.logout(),
    onSettled: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authRepository.forgotPassword(email),
  });
}

export function useValidateResetToken(token: string | null) {
  return useQuery({
    queryKey: ["password-reset", token],
    queryFn: async () => {
      await authRepository.validateResetToken(token ?? "");
      return true;
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: (input: { token: string; newPassword: string }) =>
      authRepository.confirmPasswordReset(input.token, input.newPassword),
  });
}
