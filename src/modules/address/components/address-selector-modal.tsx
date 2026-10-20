"use client";

import { useState } from "react";
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { AddressFormModal } from "@/modules/address/components/address-form-modal";
import {
  useAddresses,
  useDeleteAddress,
} from "@/modules/address/hooks/use-address";
import type { Address } from "@/modules/address/types/address";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Modal } from "@/shared/ui/modal";

type AddressSelectorModalProps = {
  open: boolean;
  onClose: () => void;
  activeAddressId: string | null;
  onSelect: (address: Address) => void;
};

export function AddressSelectorModal({
  open,
  onClose,
  activeAddressId,
  onSelect,
}: AddressSelectorModalProps) {
  const addresses = useAddresses(open);
  const deleteAddress = useDeleteAddress();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  const list = addresses.data ?? [];

  function handleSelect(address: Address) {
    onSelect(address);
    onClose();
  }

  function handleEdit(address: Address) {
    setEditingAddress(address);
    setFormOpen(true);
  }

  function handleNewAddress() {
    setEditingAddress(null);
    setFormOpen(true);
  }

  function handleSaved(address: Address) {
    onSelect(address);
  }

  return (
    <>
      <Modal
        open={open && !formOpen && !deletingAddress}
        title="Seus endereços"
        subtitle="Selecione onde deseja receber o pedido ou cadastre um novo endereço."
        onClose={onClose}
      >
        <div className="mt-4 flex flex-col gap-2.5">
          {addresses.isPending && (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Carregando endereços...
            </p>
          )}

          {addresses.isSuccess && list.length === 0 && (
            <div className="flex flex-col items-center py-6 text-center">
              <MapPin className="text-muted-foreground/30 mb-2 size-10" />
              <p className="text-foreground text-sm font-semibold">
                Nenhum endereço cadastrado
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Adicione um endereço para receber seus pedidos.
              </p>
            </div>
          )}

          {list.map((address) => {
            const isActive = address.addressId === activeAddressId;
            return (
              <div
                key={address.addressId}
                className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                  isActive
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(address)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <Check className="text-primary size-4 shrink-0" />
                    )}
                    <span className="text-foreground text-sm font-semibold">
                      {address.name}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {address.street}, {address.number}
                    {address.complement ? ` - ${address.complement}` : ""}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {address.neighborhood}, {address.city} - {address.state}
                  </p>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Editar endereço ${address.name}`}
                    onClick={() => handleEdit(address)}
                    className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir endereço ${address.name}`}
                    disabled={deleteAddress.isPending}
                    onClick={() => {
                      deleteAddress.reset();
                      setDeletingAddress(address);
                    }}
                    className="text-destructive/75 hover:text-destructive rounded-lg p-1.5 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleNewAddress}
            className="border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 flex items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-semibold transition-colors"
          >
            <Plus className="size-4" />
            Adicionar endereço
          </button>
        </div>
      </Modal>

      <AddressFormModal
        key={editingAddress?.addressId ?? "new"}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingAddress(null);
        }}
        onSaved={handleSaved}
        editingAddress={editingAddress}
      />

      <ConfirmDialog
        open={deletingAddress !== null}
        title="Excluir este endereço?"
        description={
          deletingAddress
            ? `O endereço "${deletingAddress.name}" será removido da sua conta.`
            : ""
        }
        confirmLabel="Excluir endereço"
        cancelLabel="Cancelar"
        tone="destructive"
        pending={deleteAddress.isPending}
        error={
          deleteAddress.isError
            ? getApiErrorMessage(
                deleteAddress.error,
                "Não foi possível excluir o endereço.",
              )
            : null
        }
        onConfirm={() => {
          if (!deletingAddress) return;
          deleteAddress.mutate(deletingAddress.addressId, {
            onSuccess: () => setDeletingAddress(null),
          });
        }}
        onClose={() => setDeletingAddress(null)}
      />
    </>
  );
}
