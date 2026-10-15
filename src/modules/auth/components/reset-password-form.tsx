"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useConfirmPasswordReset,
  useValidateResetToken,
} from "@/modules/auth/hooks/use-auth";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/modules/auth/schemas/auth-form";
import {
  AuthCard,
  authFieldClassName,
} from "@/modules/auth/components/auth-card";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";

function InvalidLink() {
  return (
    <AuthCard
      title="Link expirado ou inválido"
      subtitle="O link de redefinição vale por 1 hora e só pode ser usado uma vez."
    >
      <div className="flex flex-col gap-4">
        <div className="bg-destructive/10 text-destructive flex items-start gap-3 rounded-lg p-3 text-sm">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Solicite um novo link para continuar.</p>
        </div>
        <Link
          href="/forgot-password"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors"
        >
          Solicitar novo link
        </Link>
      </div>
    </AuthCard>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const validation = useValidateResetToken(token);
  const confirm = useConfirmPasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!confirm.isSuccess) return;
    const timeout = setTimeout(() => router.replace("/login"), 2500);
    return () => clearTimeout(timeout);
  }, [confirm.isSuccess, router]);

  if (!token || validation.isError) {
    return <InvalidLink />;
  }

  if (validation.isPending) {
    return (
      <AuthCard
        title="Validando link"
        subtitle="Só um instante, estamos conferindo o link do e-mail."
      >
        <div className="bg-muted h-10 animate-pulse rounded-lg" />
      </AuthCard>
    );
  }

  if (confirm.isSuccess) {
    return (
      <AuthCard
        title="Senha redefinida"
        subtitle="Você já pode entrar com a nova senha."
      >
        <div className="flex flex-col gap-4">
          <div className="bg-accent text-accent-foreground flex items-start gap-3 rounded-lg p-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Senha atualizada. Redirecionando para o login...</p>
          </div>
          <Link
            href="/login"
            className="text-primary text-center text-sm font-medium hover:underline"
          >
            Ir para entrar
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (confirm.isError && getStatus(confirm.error) === 401) {
    return <InvalidLink />;
  }

  return (
    <AuthCard
      title="Nova senha"
      subtitle="Escolha uma senha de 8 a 20 caracteres"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await confirm.mutateAsync({
              token,
              newPassword: values.newPassword,
            });
          } catch {
            // A mensagem de erro já aparece abaixo do formulário.
          }
        })}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">
            Nova senha
          </span>
          <input
            {...register("newPassword")}
            type="password"
            autoComplete="new-password"
            className={authFieldClassName}
            placeholder="Mínimo 8 caracteres"
          />
          {errors.newPassword && (
            <span className="text-destructive text-xs">
              {errors.newPassword.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">
            Confirmar nova senha
          </span>
          <input
            {...register("confirmPassword")}
            type="password"
            autoComplete="new-password"
            className={authFieldClassName}
            placeholder="Repita a senha"
          />
          {errors.confirmPassword && (
            <span className="text-destructive text-xs">
              {errors.confirmPassword.message}
            </span>
          )}
        </label>

        {confirm.isError && (
          <p className="text-destructive text-sm">
            {getApiErrorMessage(
              confirm.error,
              "Não foi possível redefinir a senha.",
            )}
          </p>
        )}

        <Button type="submit" className="h-10" disabled={confirm.isPending}>
          {confirm.isPending ? "Salvando..." : "Redefinir senha"}
        </Button>
      </form>
    </AuthCard>
  );
}

function getStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
