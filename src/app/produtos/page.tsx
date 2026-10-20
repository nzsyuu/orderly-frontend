import { ProductsPanel } from "@/modules/products/components/products-panel";
import { AppShell } from "@/modules/shell/components/app-shell";

export default function ProdutosPage() {
  return (
    <AppShell>
      <ProductsPanel />
    </AppShell>
  );
}
