"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@/modules/auth/hooks/use-auth";
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "@/modules/auth/schemas/auth-form";
import {
  AuthCard,
  authFieldClassName,
} from "@/modules/auth/components/auth-card";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";

const backToLogin = (
  <p className="text-muted-foreground text-center text-sm">
    Lembrou a senha?{" "}
    <Link href="/login" className="text-primary font-medium hover:underline">
      Voltar para entrar
    </Link>
  </p>
);

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: "" },
  });

  if (forgotPassword.isSuccess) {
    return (
      <AuthCard
        title="Verifique sua caixa de entrada"
        subtitle="Se o e-mail informado estiver cadastrado, você receberá as instruções em instantes."
        footer={backToLogin}
      >
        <div className="bg-accent text-accent-foreground flex items-start gap-3 rounded-lg p-3 text-sm">
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            O link de redefinição vale por 1 hora. Se não encontrar o e-mail,
            confira a pasta de spam.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Esqueci minha senha"
      subtitle="Informe o e-mail da sua conta para receber o link de redefinição"
      footer={backToLogin}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await forgotPassword.mutateAsync(values.email);
          } catch {
            // A mensagem de erro já aparece abaixo do formulário.
          }
        })}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">E-mail</span>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className={authFieldClassName}
            placeholder="voce@lanchonete.com"
          />
          {errors.email && (
            <span className="text-destructive text-xs">
              {errors.email.message}
            </span>
          )}
        </label>

        {forgotPassword.isError && (
          <p className="text-destructive text-sm">
            {getApiErrorMessage(
              forgotPassword.error,
              "Não foi possível enviar o e-mail. Tente novamente.",
            )}
          </p>
        )}

        <Button
          type="submit"
          className="h-10"
          disabled={forgotPassword.isPending}
        >
          {forgotPassword.isPending ? "Enviando..." : "Enviar link"}
        </Button>
      </form>
    </AuthCard>
  );
}
