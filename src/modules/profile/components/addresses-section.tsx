"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { AddressFormModal } from "@/modules/address/components/address-form-modal";
import {
  useAddresses,
  useDeleteAddress,
} from "@/modules/address/hooks/use-address";
import type { Address } from "@/modules/address/types/address";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Skeleton } from "@/shared/ui/skeleton";

const ACTIVE_ADDRESS_KEY = "activeAddressId";

export function AddressesSection() {
  const addresses = useAddresses();
  const deleteAddress = useDeleteAddress();

  const [formOpen, setFormOpen] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);

  const list = addresses.data ?? [];

  // Mesma regra do cardápio e do checkout: endereço salvo, senão o primeiro.
  const storedId =
    typeof window !== "undefined"
      ? localStorage.getItem(ACTIVE_ADDRESS_KEY)
      : null;
  const activeId =
    list.find((a) => a.addressId === storedId)?.addressId ??
    list[0]?.addressId ??
    null;

  function openNew() {
    setEditing(null);
    setFormVersion((v) => v + 1);
    setFormOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setFormOpen(true);
  }

  function handleSaved(address: Address) {
    if (!localStorage.getItem(ACTIVE_ADDRESS_KEY)) {
      localStorage.setItem(ACTIVE_ADDRESS_KEY, address.addressId);
    }
  }

  function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    deleteAddress.mutate(target.addressId, {
      onSuccess: () => {
        if (localStorage.getItem(ACTIVE_ADDRESS_KEY) === target.addressId) {
          localStorage.removeItem(ACTIVE_ADDRESS_KEY);
        }
        setDeleting(null);
      },
    });
  }

  return (
    <>
      {addresses.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      )}

      {addresses.isError && (
        <p className="text-destructive text-sm">
          Não foi possível carregar seus endereços.
        </p>
      )}

      {addresses.isSuccess && list.length === 0 && (
        <div className="flex flex-col items-center py-4 text-center">
          <MapPin className="text-muted-foreground/30 mb-2 h-9 w-9" />
          <p className="text-foreground text-sm font-medium">
            Nenhum endereço cadastrado
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Cadastre um endereço para receber seus pedidos.
          </p>
        </div>
      )}

      {list.length > 0 && (
        <ul className="flex flex-col gap-2">
          {list.map((address) => {
            const isActive = address.addressId === activeId;
            return (
              <li
                key={address.addressId}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  isActive ? "border-primary/40 bg-primary/5" : "border-border"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground text-sm font-semibold">
                      {address.name}
                    </span>
                    {isActive && (
                      <span className="bg-primary/10 text-primary rounded-sm px-1.5 py-0.5 text-[11px] font-medium">
                        Em uso
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {address.street}, {address.number}
                    {address.complement ? ` - ${address.complement}` : ""}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {address.neighborhood}, {address.city} - {address.state}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(address)}
                    aria-label={`Editar endereço ${address.name}`}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-md p-1.5 transition-colors outline-none focus-visible:ring-3"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteAddress.reset();
                      setDeleting(address);
                    }}
                    aria-label={`Excluir endereço ${address.name}`}
                    className="text-destructive/70 hover:text-destructive focus-visible:ring-ring/50 rounded-md p-1.5 transition-colors outline-none focus-visible:ring-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={openNew}
        className="border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 focus-visible:ring-ring/50 mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3"
      >
        <Plus className="h-4 w-4" />
        Novo endereço
      </button>

      <AddressFormModal
        key={editing?.addressId ?? `new-${formVersion}`}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        editingAddress={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir este endereço?"
        description={
          deleting
            ? `O endereço "${deleting.name}" será removido da sua conta.`
            : ""
        }
        confirmLabel="Excluir endereço"
        cancelLabel="Manter endereço"
        tone="destructive"
        pending={deleteAddress.isPending}
        error={
          deleteAddress.isError
            ? getApiErrorMessage(deleteAddress.error, "Não foi possível excluir o endereço.")
            : null
        }
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
