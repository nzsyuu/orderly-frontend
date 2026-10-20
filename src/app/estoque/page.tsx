import { Suspense } from "react";
import { InventoryPanel } from "@/modules/inventory/components/inventory-panel";
import { AppShell } from "@/modules/shell/components/app-shell";

export default function EstoquePage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <InventoryPanel />
      </Suspense>
    </AppShell>
  );
}
