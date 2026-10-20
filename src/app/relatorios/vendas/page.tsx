import { Suspense } from "react";
import { SalesReportPanel } from "@/modules/reports/components/sales-report-panel";
import { AppShell } from "@/modules/shell/components/app-shell";

export default function RelatorioVendasPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <SalesReportPanel />
      </Suspense>
    </AppShell>
  );
}
