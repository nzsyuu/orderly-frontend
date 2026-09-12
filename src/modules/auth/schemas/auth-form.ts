import { z } from "zod";
import { isValidCpf } from "@/modules/auth/types/cpf";

export const loginFormSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(20, "A senha deve ter no máximo 20 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe um nome com pelo menos 2 caracteres")
      .max(50, "O nome deve ter no máximo 50 caracteres"),
    cpf: z.string().refine(isValidCpf, "Informe um CPF válido"),
    email: z.email("Informe um e-mail válido"),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .max(20, "A senha deve ter no máximo 20 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const verifyFormSchema = z.object({
  token: z.string().trim().min(8, "Cole o token recebido no e-mail"),
});

export type VerifyFormValues = z.infer<typeof verifyFormSchema>;
