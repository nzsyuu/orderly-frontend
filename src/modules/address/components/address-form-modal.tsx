"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal, fieldClassName } from "@/shared/ui/modal";
import { useLookupCep, useCreateAddress, useUpdateAddress } from "@/modules/address/hooks/use-address";
import { getApiErrorMessage } from "@/shared/http/api-error";
import type { Address, CreateAddressInput } from "@/modules/address/types/address";

type AddressFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: (address: Address) => void;
  editingAddress?: Address | null;
};

const emptyForm: CreateAddressInput = {
  name: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
};

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

function buildInitialForm(address?: Address | null): CreateAddressInput {
  if (!address) return emptyForm;
  return {
    name: address.name,
    street: address.street,
    number: address.number,
    complement: address.complement,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
  };
}

export function AddressFormModal({
  open,
  onClose,
  onSaved,
  editingAddress,
}: AddressFormModalProps) {
  // State is initialized from props. Parent should use a key to reset when needed.
  const [form, setForm] = useState<CreateAddressInput>(() => buildInitialForm(editingAddress));
  const [error, setError] = useState("");
  const lookupCep = useLookupCep();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();

  const isEditing = !!editingAddress;
  const isSaving = createAddress.isPending || updateAddress.isPending;

  function setField(field: keyof CreateAddressInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCepChange(rawValue: string) {
    const formatted = formatCep(rawValue);
    setField("zipCode", formatted);

    const digits = rawValue.replace(/\D/g, "");
    if (digits.length === 8) {
      lookupCep.mutate(digits, {
        onSuccess: (result) => {
          setForm((prev) => ({
            ...prev,
            street: result.logradouro || prev.street,
            complement: result.complemento || prev.complement,
            neighborhood: result.bairro || prev.neighborhood,
            city: result.localidade || prev.city,
            state: result.uf || prev.state,
          }));
        },
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.street.trim() || !form.number.trim() || !form.neighborhood.trim() || !form.city.trim() || !form.state.trim() || !form.zipCode.trim()) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (form.city.trim().toLowerCase() !== "natal") {
      setError("No momento, realizamos entregas apenas na cidade de Natal.");
      return;
    }

    const input: CreateAddressInput = {
      ...form,
      name: form.name.trim(),
      street: form.street.trim(),
      number: form.number.trim(),
      complement: form.complement.trim(),
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zipCode: form.zipCode.replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2"),
    };

    if (isEditing && editingAddress) {
      updateAddress.mutate(
        { addressId: editingAddress.addressId, input },
        {
          onSuccess: (address) => {
            onSaved(address);
            onClose();
          },
          onError: (err) => setError(getApiErrorMessage(err)),
        },
      );
    } else {
      createAddress.mutate(input, {
        onSuccess: (address) => {
          onSaved(address);
          onClose();
        },
        onError: (err) => setError(getApiErrorMessage(err)),
      });
    }
  }

  return (
    <Modal
      open={open}
      title={isEditing ? "Editar Endereço" : "Novo Endereço"}
      subtitle="Preencha o CEP para auto-completar"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        {/* Warning Message */}
        <div className="bg-warning/15 text-warning-foreground mb-1 rounded-md p-3 text-sm">
          <strong>Aviso:</strong> No momento, realizamos entregas apenas para a cidade de <strong>Natal</strong>.
        </div>
        {/* Name (label for the address) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="addr-name" className="text-foreground text-xs font-medium">
            Apelido *
          </label>
          <input
            id="addr-name"
            type="text"
            placeholder="Ex: Casa, Trabalho..."
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className={fieldClassName}
          />
        </div>

        {/* CEP */}
        <div className="flex flex-col gap-1">
          <label htmlFor="addr-cep" className="text-foreground text-xs font-medium">
            CEP *
          </label>
          <div className="relative">
            <input
              id="addr-cep"
              type="text"
              placeholder="00000-000"
              value={form.zipCode}
              onChange={(e) => handleCepChange(e.target.value)}
              maxLength={9}
              className={fieldClassName + " w-full"}
            />
            {lookupCep.isPending && (
              <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
            )}
          </div>
          {lookupCep.isError && (
            <p className="text-destructive text-xs">CEP não encontrado</p>
          )}
        </div>

        {/* Street + Number */}
        <div className="grid grid-cols-[1fr_100px] gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="addr-street" className="text-foreground text-xs font-medium">
              Rua *
            </label>
            <input
              id="addr-street"
              type="text"
              placeholder="Rua, Av..."
              value={form.street}
              onChange={(e) => setField("street", e.target.value)}
              className={fieldClassName}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="addr-number" className="text-foreground text-xs font-medium">
              Nº *
            </label>
            <input
              id="addr-number"
              type="text"
              placeholder="Nº"
              value={form.number}
              onChange={(e) => setField("number", e.target.value)}
              className={fieldClassName}
            />
          </div>
        </div>

        {/* Complement */}
        <div className="flex flex-col gap-1">
          <label htmlFor="addr-complement" className="text-foreground text-xs font-medium">
            Complemento
          </label>
          <input
            id="addr-complement"
            type="text"
            placeholder="Apto, Bloco, Sala..."
            value={form.complement}
            onChange={(e) => setField("complement", e.target.value)}
            className={fieldClassName}
          />
        </div>

        {/* Neighborhood */}
        <div className="flex flex-col gap-1">
          <label htmlFor="addr-neighborhood" className="text-foreground text-xs font-medium">
            Bairro *
          </label>
          <input
            id="addr-neighborhood"
            type="text"
            placeholder="Bairro"
            value={form.neighborhood}
            onChange={(e) => setField("neighborhood", e.target.value)}
            className={fieldClassName}
          />
        </div>

        {/* City + State */}
        <div className="grid grid-cols-[1fr_80px] gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="addr-city" className="text-foreground text-xs font-medium">
              Cidade *
            </label>
            <input
              id="addr-city"
              type="text"
              placeholder="Cidade"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              className={fieldClassName}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="addr-state" className="text-foreground text-xs font-medium">
              UF *
            </label>
            <input
              id="addr-state"
              type="text"
              placeholder="UF"
              maxLength={2}
              value={form.state}
              onChange={(e) => setField("state", e.target.value.toUpperCase())}
              className={fieldClassName}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-destructive rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border-border text-muted-foreground hover:bg-muted flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex flex-[2] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
