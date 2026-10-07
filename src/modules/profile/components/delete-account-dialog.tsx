"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useDeleteAccount } from "@/modules/profile/hooks/use-profile";
import {
  deleteAccountFormSchema,
  type DeleteAccountFormValues,
} from "@/modules/profile/schemas/profile-form";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Modal, fieldClassName } from "@/shared/ui/modal";

type DeleteAccountDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const deleteAccount = useDeleteAccount();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountFormSchema),
    defaultValues: { password: "" },
  });

  function handleClose() {
    if (deleteAccount.isPending) return;
    reset();
    deleteAccount.reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Excluir conta"
      subtitle="Seus dados, endereços e pedidos serão removidos de forma permanente. Digite sua senha para confirmar."
      onClose={handleClose}
    >
      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await deleteAccount.mutateAsync(values.password);
          } catch {
            // A mensagem de erro aparece abaixo do campo.
          }
        })}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-xs font-medium">Senha</span>
          <input
            {...register("password", { onChange: () => deleteAccount.reset() })}
            type="password"
            autoComplete="current-password"
            autoFocus
            className={fieldClassName}
          />
          {errors.password && (
            <span className="text-destructive text-xs">
              {errors.password.message}
            </span>
          )}
        </label>

        {deleteAccount.isError && (
          <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-xs font-medium">
            {getApiErrorMessage(
              deleteAccount.error,
              "Não foi possível excluir a conta. Confira a senha.",
            )}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleteAccount.isPending}
            className="border-border text-muted-foreground hover:bg-muted focus-visible:ring-ring/50 flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 disabled:opacity-50"
          >
            Manter minha conta
          </button>
          <button
            type="submit"
            disabled={deleteAccount.isPending}
            className="bg-destructive hover:bg-destructive/90 focus-visible:ring-ring/50 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors outline-none focus-visible:ring-3 disabled:opacity-50"
          >
            {deleteAccount.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Excluir conta
          </button>
        </div>
      </form>
    </Modal>
  );
}
