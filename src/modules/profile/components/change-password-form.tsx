"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useUpdatePassword } from "@/modules/profile/hooks/use-profile";
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from "@/modules/profile/schemas/profile-form";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { fieldClassName } from "@/shared/ui/modal";

export function ChangePasswordForm() {
  const updatePassword = useUpdatePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const clearFeedback = () => {
    if (!updatePassword.isIdle) updatePassword.reset();
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(async (values) => {
        try {
          await updatePassword.mutateAsync({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          });
          reset();
        } catch {
          // A mensagem de erro aparece abaixo dos campos.
        }
      })}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-foreground text-xs font-medium">Senha atual</span>
        <input
          {...register("currentPassword", { onChange: clearFeedback })}
          type="password"
          autoComplete="current-password"
          className={fieldClassName}
        />
        {errors.currentPassword && (
          <span className="text-destructive text-xs">
            {errors.currentPassword.message}
          </span>
        )}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-xs font-medium">Nova senha</span>
          <input
            {...register("newPassword", { onChange: clearFeedback })}
            type="password"
            autoComplete="new-password"
            placeholder="8 a 20 caracteres"
            className={fieldClassName}
          />
          {errors.newPassword && (
            <span className="text-destructive text-xs">
              {errors.newPassword.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-xs font-medium">
            Confirmar nova senha
          </span>
          <input
            {...register("confirmNewPassword", { onChange: clearFeedback })}
            type="password"
            autoComplete="new-password"
            className={fieldClassName}
          />
          {errors.confirmNewPassword && (
            <span className="text-destructive text-xs">
              {errors.confirmNewPassword.message}
            </span>
          )}
        </label>
      </div>

      {updatePassword.isError && (
        <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-xs font-medium">
          {getApiErrorMessage(
            updatePassword.error,
            "Não foi possível alterar a senha. Confira a senha atual.",
          )}
        </p>
      )}
      {updatePassword.isSuccess && (
        <p role="status" className="text-success text-xs font-medium">
          Senha alterada.
        </p>
      )}

      <button
        type="submit"
        disabled={updatePassword.isPending}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 flex items-center justify-center gap-2 self-start rounded-lg px-5 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 disabled:opacity-50"
      >
        {updatePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Alterar senha
      </button>
    </form>
  );
}
