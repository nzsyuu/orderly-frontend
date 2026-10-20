import { Suspense } from "react";
import { StockReportPanel } from "@/modules/reports/components/stock-report-panel";
import { AppShell } from "@/modules/shell/components/app-shell";

export default function RelatorioEstoquePage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <StockReportPanel />
      </Suspense>
    </AppShell>
  );
}
