"use client";

import { useState } from "react";
import { MapPin, Plus, Check, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/shared/ui/modal";
import { useAddresses, useDeleteAddress } from "@/modules/address/hooks/use-address";
import { AddressFormModal } from "@/modules/address/components/address-form-modal";
import type { Address } from "@/modules/address/types/address";

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

  const list = addresses.data ?? [];

  function handleSelect(address: Address) {
    onSelect(address);
    onClose();
  }

  function handleEdit(address: Address) {
    setEditingAddress(address);
    setFormOpen(true);
  }

  function handleDelete(address: Address) {
    if (!confirm(`Excluir o endereço "${address.name}"?`)) return;
    deleteAddress.mutate(address.addressId);
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
        open={open && !formOpen}
        title="Seus Endereços"
        subtitle="Selecione ou cadastre um endereço de entrega"
        onClose={onClose}
      >
        <div className="mt-4 flex flex-col gap-2">
          {addresses.isPending && (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Carregando endereços...
            </p>
          )}

          {addresses.isSuccess && list.length === 0 && (
            <div className="flex flex-col items-center py-6">
              <MapPin className="text-muted-foreground/30 mb-2 h-10 w-10" />
              <p className="text-muted-foreground text-sm font-medium">
                Nenhum endereço cadastrado
              </p>
              <p className="text-muted-foreground/70 mt-1 text-xs">
                Adicione um endereço para receber seus pedidos
              </p>
            </div>
          )}

          {list.map((address) => {
            const isActive = address.addressId === activeAddressId;
            return (
              <div
                key={address.addressId}
                className={`border-border flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  isActive ? "border-primary/40 bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(address)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-1.5">
                    {isActive && <Check className="text-primary h-3.5 w-3.5 shrink-0" />}
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
                    onClick={() => handleEdit(address)}
                    className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={deleteAddress.isPending}
                    onClick={() => handleDelete(address)}
                    className="text-destructive/70 hover:text-destructive rounded-md p-1.5 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new address button */}
          <button
            type="button"
            onClick={handleNewAddress}
            className="border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 flex items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
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
    </>
  );
}
