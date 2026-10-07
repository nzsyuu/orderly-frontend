import { Check, XCircle } from "lucide-react";
import {
  ORDER_FLOW,
  getStatusConfig,
  statusConfig,
} from "@/modules/orders/lib/order-status";

export function OrderStatusStepper({ status }: { status: string }) {
  if (status === "CANCELADA") {
    const cfg = statusConfig.CANCELADA;
    return (
      <div className="bg-destructive/10 flex items-start gap-3 rounded-lg p-4">
        <XCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-destructive text-sm font-semibold">{cfg.label}</p>
          <p className="text-destructive/80 text-xs">{cfg.description}</p>
        </div>
      </div>
    );
  }

  const flowIndex = ORDER_FLOW.findIndex((step) => step === status);
  // Status desconhecido: mantém na primeira etapa até chegar um valor conhecido.
  const currentIndex = flowIndex === -1 ? 0 : flowIndex;
  const finished = status === "ENTREGUE";

  return (
    <ol aria-label="Etapas do pedido">
      {ORDER_FLOW.map((step, index) => {
        const cfg = getStatusConfig(step);
        const Icon = cfg.icon;
        const isDone = finished ? index <= currentIndex : index < currentIndex;
        const isCurrent = !finished && index === currentIndex;
        const isLast = index === ORDER_FLOW.length - 1;

        return (
          <li
            key={step}
            aria-current={isCurrent ? "step" : undefined}
            className={`relative flex gap-4 ${isLast ? "" : "pb-7"}`}
          >
            {!isLast && (
              <span
                aria-hidden
                className={`absolute top-9 bottom-1 left-[15px] w-0.5 rounded-full ${
                  isDone ? "bg-primary" : "bg-border"
                }`}
              />
            )}

            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              {isCurrent && (
                <span
                  aria-hidden
                  className="bg-primary/25 absolute inset-0 rounded-full motion-safe:animate-ping"
                />
              )}
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-card text-primary ring-primary/20 ring-4"
                      : "border-border bg-card text-muted-foreground/50"
                }`}
              >
                {isDone ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </span>
            </span>

            <div className="min-w-0 pt-1">
              <p
                className={`text-sm leading-6 ${
                  isCurrent
                    ? "text-foreground font-semibold"
                    : isDone
                      ? "text-foreground font-medium"
                      : "text-muted-foreground/70"
                }`}
              >
                {cfg.label}
              </p>
              {isCurrent && (
                <p className="text-muted-foreground text-xs">
                  {cfg.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
