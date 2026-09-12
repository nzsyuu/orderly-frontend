"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVerifyAccount } from "@/modules/auth/hooks/use-auth";
import {
  verifyFormSchema,
  type VerifyFormValues,
} from "@/modules/auth/schemas/auth-form";
import {
  AuthCard,
  authFieldClassName,
} from "@/modules/auth/components/auth-card";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";

export function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const tokenFromUrl = searchParams.get("token");
  const verifyAccount = useVerifyAccount();
  const autoStarted = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      token: tokenFromUrl ?? "",
    },
  });

  useEffect(() => {
    if (!tokenFromUrl || autoStarted.current) return;
    autoStarted.current = true;
    setValue("token", tokenFromUrl);
    void verifyAccount.mutateAsync(tokenFromUrl).catch(() => {});
  }, [setValue, tokenFromUrl, verifyAccount]);

  return (
    <AuthCard
      title="Verificar conta"
      subtitle="A API só libera o acesso depois da confirmação"
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Já verificou?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <p className="text-muted-foreground mb-4 text-sm">
        {email
          ? `Enviamos um link para ${email}. Se o e-mail não chegar (comum no ambiente local), cole o token da URL de verificação.`
          : "Cole o token do e-mail ou abra o link no formato /verificar?token=..."}
      </p>

      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await verifyAccount.mutateAsync(values.token.trim());
          } catch {
            // A mensagem de erro já aparece abaixo do formulário.
          }
        })}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">
            Token de verificação
          </span>
          <input
            {...register("token")}
            autoComplete="one-time-code"
            className={authFieldClassName}
            placeholder="Cole o UUID do e-mail"
          />
          {errors.token && (
            <span className="text-destructive text-xs">
              {errors.token.message}
            </span>
          )}
        </label>

        {verifyAccount.isError && (
          <p className="text-destructive text-sm">
            {getApiErrorMessage(
              verifyAccount.error,
              "Não foi possível verificar a conta.",
            )}
          </p>
        )}

        <Button
          type="submit"
          className="h-10"
          disabled={verifyAccount.isPending}
        >
          {verifyAccount.isPending ? "Verificando..." : "Verificar e entrar"}
        </Button>
      </form>
    </AuthCard>
  );
}
