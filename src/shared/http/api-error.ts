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
  if (lower.includes("unfortunately, we do not deliver to the city")) {
    return "Infelizmente ainda não fazemos entregas para esta cidade.";
  }
  if (lower.includes("expiry date is required")) {
    return "Informe a data de validade para registrar uma entrada.";
  }
  if (lower.includes("insufficient stock lots")) {
    return "Não há lotes suficientes para baixar essa quantidade.";
  }
  if (lower.includes("insufficient stock")) {
    return "Estoque insuficiente para essa movimentação.";
  }
  if (lower.includes("store not found")) {
    return "Loja não encontrada.";
  }
  if (lower.includes("store name is required")) {
    return "Informe o nome da loja.";
  }
  if (lower.includes("store name must have at most")) {
    return "O nome deve ter no máximo 120 caracteres.";
  }
  if (lower.includes("opening and closing times are required")) {
    return "Informe os horários de abertura e fechamento.";
  }
  if (lower.includes("opening time is required")) {
    return "Informe o horário de abertura.";
  }
  if (lower.includes("closing time is required")) {
    return "Informe o horário de fechamento.";
  }
  if (lower.includes("maximum orders in progress must be greater than zero")) {
    return "O limite de pedidos deve ser maior que zero.";
  }
  if (lower.includes("store street is required")) {
    return "Informe o logradouro.";
  }
  if (lower.includes("store number is required")) {
    return "Informe o número.";
  }
  if (lower.includes("address number must be digits")) {
    return "O número do endereço deve conter apenas dígitos.";
  }
  if (lower.includes("store neighborhood is required")) {
    return "Informe o bairro.";
  }
  if (lower.includes("store city is required")) {
    return "Informe a cidade.";
  }
  if (lower.includes("store zip code is required")) {
    return "Informe o CEP.";
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
