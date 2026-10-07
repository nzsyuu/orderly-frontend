import { z } from "zod";

export const profileNameFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
});

export type ProfileNameFormValues = z.infer<typeof profileNameFormSchema>;

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .max(20, "A senha deve ter no máximo 20 caracteres"),
    confirmNewPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: "As senhas não coincidem",
    path: ["confirmNewPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "A nova senha precisa ser diferente da atual",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export const deleteAccountFormSchema = z.object({
  password: z.string().min(1, "Informe sua senha para excluir a conta"),
});

export type DeleteAccountFormValues = z.infer<typeof deleteAccountFormSchema>;
