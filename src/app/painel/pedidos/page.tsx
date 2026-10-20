import { OrdersBoard } from "@/modules/sales/components/orders-board";
import { AppShell } from "@/modules/shell/components/app-shell";

export default function PedidosPage() {
  return (
    <AppShell>
      <OrdersBoard />
    </AppShell>
  );
}
