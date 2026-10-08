import { OrdersBoard } from "@/modules/sales/components/orders-board";
import { AppShell } from "@/modules/shell/components/app-shell";

export default function PedidosPage() {
  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <h1 className="text-2xl font-bold tracking-tight mb-6">
          Gestão de Pedidos
        </h1>
        <div className="flex-1 overflow-hidden">
          <OrdersBoard />
        </div>
      </div>
    </AppShell>
  );
}
