import axios from "axios";
import { ZodError } from "zod";

function translateApiMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("already in use")) {
    return "Este e-mail já está em uso.";
  }
  if (lower.includes("already exists") && lower.includes("cpf")) {
    return "Este CPF já está cadastrado.";
  }
  if (lower.includes("not verified")) {
    return "Conta ainda não verificada. Use o token do e-mail na tela de verificação.";
  }
  if (lower.includes("invalid e-mail or password")) {
    return "E-mail ou senha inválidos.";
  }
  if (lower.includes("not valid") && lower.includes("token")) {
    return "Token de verificação inválido ou expirado.";
  }
  if (lower.includes("cpf must be a valid")) {
    return "Informe um CPF válido.";
  }
  if (lower.includes("is locked")) {
    return "Conta temporariamente bloqueada. Tente de novo em alguns minutos.";
  }

  return message;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Não foi possível concluir a operação.",
) {
  if (error instanceof ZodError) {
    return fallback;
  }

  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return translateApiMessage(message);
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return translateApiMessage(error.message);
  }

  return fallback;
}
