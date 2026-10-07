"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { AuthUser } from "@/modules/auth/types/user";
import { useUpdateName } from "@/modules/profile/hooks/use-profile";
import {
  profileNameFormSchema,
  type ProfileNameFormValues,
} from "@/modules/profile/schemas/profile-form";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { fieldClassName } from "@/shared/ui/modal";

export function ProfileNameForm({ user }: { user: AuthUser }) {
  const updateName = useUpdateName();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileNameFormValues>({
    resolver: zodResolver(profileNameFormSchema),
    values: { name: user.name },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(async (values) => {
        try {
          await updateName.mutateAsync(values.name);
        } catch {
          // A mensagem de erro aparece abaixo do campo.
        }
      })}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-foreground text-xs font-medium">Nome</span>
        <input
          {...register("name", { onChange: () => updateName.reset() })}
          type="text"
          autoComplete="name"
          className={fieldClassName}
        />
        {errors.name && (
          <span className="text-destructive text-xs">{errors.name.message}</span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-foreground text-xs font-medium">E-mail</span>
        <input
          type="email"
          value={user.email}
          readOnly
          aria-describedby="profile-email-hint"
          className={`${fieldClassName} bg-muted text-muted-foreground cursor-not-allowed`}
        />
        <span id="profile-email-hint" className="text-muted-foreground text-xs">
          O e-mail não pode ser alterado.
        </span>
      </label>

      {updateName.isError && (
        <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-xs font-medium">
          {getApiErrorMessage(updateName.error, "Não foi possível salvar o nome.")}
        </p>
      )}
      {updateName.isSuccess && !isDirty && (
        <p role="status" className="text-success text-xs font-medium">
          Nome salvo.
        </p>
      )}

      <button
        type="submit"
        disabled={!isDirty || updateName.isPending}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 flex items-center justify-center gap-2 self-start rounded-lg px-5 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 disabled:opacity-50"
      >
        {updateName.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Salvar nome
      </button>
    </form>
  );
}
