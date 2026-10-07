"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  User,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  Loader2,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { useSession } from "@/modules/auth/hooks/use-auth";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { useAddresses } from "@/modules/address/hooks/use-address";
import { useFreight, useCheckout } from "@/modules/checkout/hooks/use-checkout";
import { AddressFormModal } from "@/modules/address/components/address-form-modal";
import { AddressSelectorModal } from "@/modules/address/components/address-selector-modal";
import { formatBRL } from "@/shared/lib/format";
import { getApiErrorMessage } from "@/shared/http/api-error";
import type { Address } from "@/modules/address/types/address";

type CheckoutStep = "review" | "payment";

export function CheckoutPage() {
  const router = useRouter();
  const session = useSession();
  const cart = useCart();
  const addresses = useAddresses(!!session.data);
  const checkout = useCheckout();

  const [step, setStep] = useState<CheckoutStep>("review");
  const [overrideAddressId, setOverrideAddressId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [observation, setObservation] = useState("");
  const [error, setError] = useState("");
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressSelectorOpen, setAddressSelectorOpen] = useState(false);

  const user = session.data;
  const items = cart.data?.items ?? [];
  const subTotal = cart.data?.subTotal ?? 0;

  // Derive the selected address without setState in an effect
  const selectedAddress = useMemo<Address | null>(() => {
    const list = addresses.data;
    if (!list || list.length === 0) return null;

    if (overrideAddressId) {
      const found = list.find((a) => a.addressId === overrideAddressId);
      if (found) return found;
    }

    const storedId = typeof window !== "undefined" ? localStorage.getItem("activeAddressId") : null;
    if (storedId) {
      const found = list.find((a) => a.addressId === storedId);
      if (found) return found;
    }

    return list[0];
  }, [addresses.data, overrideAddressId]);

  const freight = useFreight(selectedAddress?.addressId ?? null);

  const deliveryFee = freight.data?.deliveryFee ?? 0;
  const total = subTotal + deliveryFee;

  const handleAddressSelect = useCallback((address: Address) => {
    setOverrideAddressId(address.addressId);
    localStorage.setItem("activeAddressId", address.addressId);
  }, []);

  function handleConfirmOrder() {
    if (!cart.data || !selectedAddress || !selectedPayment) return;
    setError("");

    checkout.mutate(
      {
        shoppingCartId: cart.data.id,
        addressId: selectedAddress.addressId,
        storeId: 1,
        observation: observation.trim(),
      },
      {
        onSuccess: (sale) => {
          router.replace(`/pedidos/${sale.saleId}?novo=1`);
        },
        onError: (err) => {
          setError(getApiErrorMessage(err, "Não foi possível finalizar o pedido."));
        },
      },
    );
  }

  // Redirect if not logged in
  useEffect(() => {
    if (session.isSuccess && !session.data) {
      router.replace("/login");
    }
  }, [session.isSuccess, session.data, router]);

  // Redirect if cart is empty (only on review step)
  useEffect(() => {
    if (cart.isSuccess && items.length === 0 && step === "review" && !checkout.isSuccess) {
      router.replace("/cardapio");
    }
  }, [cart.isSuccess, items.length, step, checkout.isSuccess, router]);

  if (!user || (cart.isSuccess && items.length === 0) || checkout.isSuccess) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  // ---------- REVIEW STEP ----------
  if (step === "review") {
    const hasAddresses = (addresses.data?.length ?? 0) > 0;

    return (
      <div className="bg-background flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-border bg-card sticky top-0 z-40 border-b">
          <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-foreground text-lg font-bold">
              Confirmar Pedido
            </h1>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
          {/* User info */}
          <section className="border-border bg-card mb-4 rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-primary h-4 w-4" />
              <h2 className="text-foreground text-sm font-semibold">Seus dados</h2>
            </div>
            <p className="text-foreground text-sm">{user.name}</p>
            <p className="text-muted-foreground text-xs">{user.email}</p>
          </section>

          {/* Delivery address */}
          <section className="border-border bg-card mb-4 rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="text-primary h-4 w-4" />
                <h2 className="text-foreground text-sm font-semibold">Endereço de entrega</h2>
              </div>
              {hasAddresses && (
                <button
                  type="button"
                  onClick={() => setAddressSelectorOpen(true)}
                  className="text-primary text-xs font-medium hover:underline"
                >
                  Alterar
                </button>
              )}
            </div>

            {!hasAddresses ? (
              <button
                type="button"
                onClick={() => setAddressFormOpen(true)}
                className="border-border text-muted-foreground hover:text-foreground hover:border-primary/30 w-full rounded-lg border border-dashed px-4 py-3 text-sm font-medium transition-colors"
              >
                + Cadastrar endereço
              </button>
            ) : selectedAddress ? (
              <div>
                <p className="text-foreground text-sm font-medium">{selectedAddress.name}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {selectedAddress.street}, {selectedAddress.number}
                  {selectedAddress.complement ? ` - ${selectedAddress.complement}` : ""}
                  <br />
                  {selectedAddress.neighborhood}, {selectedAddress.city} - {selectedAddress.state}
                  <br />
                  CEP: {selectedAddress.zipCode}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">Selecionando endereço...</p>
            )}

            {freight.isError && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2">
                <AlertTriangle className="text-destructive h-3.5 w-3.5 shrink-0" />
                <p className="text-destructive text-xs font-medium">
                  {getApiErrorMessage(freight.error, "Não foi possível calcular o frete.")}
                </p>
              </div>
            )}
          </section>

          {/* Items */}
          <section className="border-border bg-card mb-4 rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="text-primary h-4 w-4" />
              <h2 className="text-foreground text-sm font-semibold">
                Itens ({items.length})
              </h2>
            </div>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm">
                      {item.quantity}x {item.productName}
                    </p>
                    {item.observation && (
                      <p className="text-muted-foreground text-xs italic">
                        Obs: {item.observation}
                      </p>
                    )}
                  </div>
                  <span className="text-foreground shrink-0 text-sm font-medium">
                    {formatBRL(item.totalPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Observation */}
          <section className="border-border bg-card mb-4 rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="text-primary h-4 w-4" />
              <h2 className="text-foreground text-sm font-semibold">Observação do pedido</h2>
            </div>
            <textarea
              rows={2}
              placeholder="Ex: Troco para R$ 100, sem cebola..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="border-input bg-background focus:border-ring focus:ring-ring/30 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </section>

          {/* Summary */}
          <section className="border-border bg-card mb-4 rounded-lg border p-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatBRL(subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de entrega</span>
                <span className="text-foreground">
                  {freight.isPending ? (
                    <Loader2 className="inline h-3 w-3 animate-spin" />
                  ) : freight.isError ? (
                    "—"
                  ) : (
                    formatBRL(deliveryFee)
                  )}
                </span>
              </div>
              <div className="border-border mt-1 border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="font-display text-foreground text-lg font-bold">
                    {freight.isPending ? (
                      <Loader2 className="inline h-4 w-4 animate-spin" />
                    ) : freight.isError ? (
                      "—"
                    ) : (
                      formatBRL(total)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom CTA */}
        <div className="border-border bg-card sticky bottom-0 border-t px-4 py-4">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              disabled={!selectedAddress || freight.isPending || freight.isError}
              onClick={() => setStep("payment")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Ir para pagamento
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <AddressFormModal
          open={addressFormOpen}
          onClose={() => setAddressFormOpen(false)}
          onSaved={handleAddressSelect}
        />
        <AddressSelectorModal
          open={addressSelectorOpen}
          onClose={() => setAddressSelectorOpen(false)}
          activeAddressId={selectedAddress?.addressId ?? null}
          onSelect={handleAddressSelect}
        />
      </div>
    );
  }

  // ---------- PAYMENT STEP ----------
  if (step === "payment") {
    const paymentMethods = [
      { id: "credit", label: "Cartão de Crédito", icon: CreditCard },
      { id: "debit", label: "Cartão de Débito", icon: CreditCard },
      { id: "pix", label: "PIX", icon: QrCode },
      { id: "cash", label: "Dinheiro", icon: Banknote },
      { id: "wallet", label: "Carteira Digital", icon: Wallet },
    ];

    return (
      <div className="bg-background flex min-h-screen flex-col">
        <header className="border-border bg-card sticky top-0 z-40 border-b">
          <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
            <button
              type="button"
              onClick={() => setStep("review")}
              className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-foreground text-lg font-bold">
              Pagamento
            </h1>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
          <section className="border-border bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-primary h-4 w-4" />
              <h2 className="text-foreground text-sm font-semibold">
                Forma de pagamento
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPayment === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex items-center gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {method.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="text-primary ml-auto h-5 w-5" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Order total reminder */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-muted-foreground text-sm">Total do pedido</span>
            <span className="font-display text-foreground text-lg font-bold">
              {formatBRL(total)}
            </span>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2">
              <AlertTriangle className="text-destructive h-3.5 w-3.5 shrink-0" />
              <p className="text-destructive text-xs font-medium">{error}</p>
            </div>
          )}
        </main>

        <div className="border-border bg-card sticky bottom-0 border-t px-4 py-4">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              disabled={!selectedPayment || checkout.isPending}
              onClick={handleConfirmOrder}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {checkout.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Confirmar pedido • {formatBRL(total)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
