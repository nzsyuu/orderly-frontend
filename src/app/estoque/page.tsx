import { InventoryPanel } from "@/modules/inventory/components/inventory-panel";
import { StatCards } from "@/modules/inventory/components/stat-cards";
import { AppShell } from "@/modules/shell/components/app-shell";

export default function EstoquePage() {
  return (
    <AppShell>
      <StatCards />
      <InventoryPanel />
    </AppShell>
  );
}
