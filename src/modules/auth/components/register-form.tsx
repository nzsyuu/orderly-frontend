"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/modules/auth/hooks/use-auth";
import {
  formatCpf,
  registerFormSchema,
  type RegisterFormValues,
} from "@/modules/auth/schemas/auth-form";
import {
  AuthCard,
  authFieldClassName,
} from "@/modules/auth/components/auth-card";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";

export function RegisterForm() {
  const registerAccount = useRegister();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Cadastre-se para acessar estoque e produtos"
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await registerAccount.mutateAsync({
              name: values.name,
              cpf: values.cpf,
              email: values.email,
              password: values.password,
            });
          } catch {
            // A mensagem de erro já aparece abaixo do formulário.
          }
        })}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Nome</span>
          <input
            {...register("name")}
            autoComplete="name"
            className={authFieldClassName}
            placeholder="Seu nome"
          />
          {errors.name && (
            <span className="text-destructive text-xs">
              {errors.name.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">CPF</span>
          <input
            {...register("cpf")}
            inputMode="numeric"
            autoComplete="off"
            className={authFieldClassName}
            placeholder="000.000.000-00"
            onChange={(event) => {
              setValue("cpf", formatCpf(event.target.value), {
                shouldValidate: true,
              });
            }}
          />
          {errors.cpf && (
            <span className="text-destructive text-xs">
              {errors.cpf.message}
            </span>
          )}
        </label>

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
            autoComplete="new-password"
            className={authFieldClassName}
            placeholder="Entre 8 e 20 caracteres"
          />
          {errors.password && (
            <span className="text-destructive text-xs">
              {errors.password.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">
            Confirmar senha
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

        {registerAccount.isError && (
          <p className="text-destructive text-sm">
            {getApiErrorMessage(
              registerAccount.error,
              "Não foi possível criar a conta.",
            )}
          </p>
        )}

        <Button
          type="submit"
          className="h-10"
          disabled={registerAccount.isPending}
        >
          {registerAccount.isPending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </AuthCard>
  );
}
