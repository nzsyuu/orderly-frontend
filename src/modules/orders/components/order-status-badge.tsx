import { getStatusConfig } from "@/modules/orders/lib/order-status";

export function OrderStatusBadge({ status }: { status: string }) {
  const cfg = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}
    >
      <span className={`size-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
