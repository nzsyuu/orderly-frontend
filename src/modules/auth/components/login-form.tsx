"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/modules/auth/hooks/use-auth";
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/modules/auth/schemas/auth-form";
import {
  AuthCard,
  authFieldClassName,
} from "@/modules/auth/components/auth-card";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const errorMessage = login.isError
    ? getApiErrorMessage(login.error, "E-mail ou senha inválidos.")
    : null;

  return (
    <AuthCard
      title="Entrar"
      subtitle="Use a conta cadastrada na API local"
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="text-primary font-medium hover:underline"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await login.mutateAsync(values);
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

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Senha</span>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            className={authFieldClassName}
            placeholder="Mínimo 8 caracteres"
          />
          {errors.password && (
            <span className="text-destructive text-xs">
              {errors.password.message}
            </span>
          )}
        </label>

        {errorMessage && (
          <div className="flex flex-col gap-1">
            <p className="text-destructive text-sm">{errorMessage}</p>
            {errorMessage.toLowerCase().includes("não verificada") && (
              <Link
                href="/verificar"
                className="text-primary text-sm font-medium hover:underline"
              >
                Ir para verificação
              </Link>
            )}
          </div>
        )}

        <Button type="submit" className="h-10" disabled={login.isPending}>
          {login.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthCard>
  );
}
