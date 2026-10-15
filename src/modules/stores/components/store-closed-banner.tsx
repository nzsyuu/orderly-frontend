"use client";

import { Clock, PauseCircle } from "lucide-react";
import type { Store } from "@/modules/stores/types/store";
import { toTimeInputValue } from "@/modules/stores/lib/time";

/** Avisa que a loja não está aceitando pedidos. Não renderiza quando está aberta. */
export function StoreClosedBanner({ store }: { store: Store | undefined }) {
  if (!store || store.status === "ABERTA") return null;

  const paused = store.status === "PAUSADA";
  const Icon = paused ? PauseCircle : Clock;
  const opening = toTimeInputValue(store.openingTime);

  const title = paused
    ? "Novos pedidos pausados por enquanto"
    : "Estamos fechados agora";
  const detail = paused
    ? "A cozinha está com muitos pedidos em andamento. Você pode olhar o cardápio e voltar daqui a pouco."
    : store.manualStatus
      ? "Você pode olhar o cardápio, mas só dá para pedir quando a loja abrir."
      : `Você pode olhar o cardápio. Abrimos às ${opening}.`;

  return (
    <div
      role="status"
      className="border-warning/40 bg-warning/15 text-warning-foreground border-b"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 sm:px-6">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p className="text-sm">
          <span className="font-display font-bold">{title}.</span> {detail}
        </p>
      </div>
    </div>
  );
}
