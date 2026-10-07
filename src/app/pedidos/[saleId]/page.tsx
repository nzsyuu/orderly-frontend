import { OrderTrackingPage } from "@/modules/orders/components/order-tracking-page";

export default async function PedidoRoute({
  params,
  searchParams,
}: PageProps<"/pedidos/[saleId]">) {
  const { saleId } = await params;
  const { novo } = await searchParams;
  return <OrderTrackingPage saleId={saleId} isNew={novo === "1"} />;
}
