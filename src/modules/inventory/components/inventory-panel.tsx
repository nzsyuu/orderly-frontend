"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  CalendarClock,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { CreateStockItemDialog } from "@/modules/inventory/components/create-stock-item-dialog";
import { EditStockItemDialog } from "@/modules/inventory/components/edit-stock-item-dialog";
import { RegisterMovementDialog } from "@/modules/inventory/components/register-movement-dialog";
import { StatCards } from "@/modules/inventory/components/stat-cards";
import { StockItemLotsDialog } from "@/modules/inventory/components/stock-item-lots-dialog";
import {
  useDeleteStockItem,
  useStockItems,
} from "@/modules/inventory/hooks/use-stock-items";
import { stockCategoryOptions } from "@/modules/inventory/schemas/stock-item-form";
import {
  statusOfItem,
  type StockItem,
  type StockStatus,
} from "@/modules/inventory/types/stock-item";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { formatBRL, formatNumber } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { EmptyState, PageHeader } from "@/shared/ui/page";
import { Skeleton } from "@/shared/ui/skeleton";

const statusConfig: Record<
  StockStatus,
  { label: string; className: string; dot: string }
> = {
  ok: {
    label: "Em dia",
    className: "bg-success/12 text-success",
    dot: "bg-success",
  },
  baixo: {
    label: "Estoque baixo",
    className: "bg-warning/15 text-warning",
    dot: "bg-warning",
  },
  esgotado: {
    label: "Esgotado",
    className: "bg-destructive/12 text-destructive",
    dot: "bg-destructive",
  },
};

function StatusBadge({ status }: { status: StockStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}
    >
      <span className={`size-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StockLevel({ item }: { item: StockItem }) {
  const status = statusOfItem(item);
  const pct = Math.min(
    100,
    Math.round((item.currentQuantity / (item.minimumStock * 2 || 1)) * 100),
  );
  const barColor =
    status === "esgotado"
      ? "bg-destructive"
      : status === "baixo"
        ? "bg-warning"
        : "bg-primary";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1.5">
        <span className="font-condensed tabular text-foreground text-lg font-extrabold">
          {formatNumber(item.currentQuantity)}
        </span>
        <span className="text-muted-foreground tabular text-xs">
          {item.unit} · mín. {formatNumber(item.minimumStock)}
        </span>
      </div>
      <div className="bg-muted h-1.5 w-32 overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function parseInitialStatus(raw: string | null): StockStatus | "todos" {
  if (raw === "ok" || raw === "baixo" || raw === "esgotado") return raw;
  return "todos";
}

export function InventoryPanel() {
  const searchParams = useSearchParams();
  const { data: items = [], isLoading, isError } = useStockItems();
  const deleteStockItem = useDeleteStockItem();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [filter, setFilter] = useState(
    () => searchParams.get("categoria") ?? "todos",
  );
  const [statusFilter, setStatusFilter] = useState<StockStatus | "todos">(() =>
    parseInitialStatus(searchParams.get("status")),
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [lotsItem, setLotsItem] = useState<StockItem | null>(null);
  const [movementItem, setMovementItem] = useState<StockItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<StockItem | null>(null);

  const filters = useMemo(() => {
    const extras = items.map((item) => item.category);
    const categories = [...new Set([...stockCategoryOptions(), ...extras])];
    return [
      { label: "Todas", value: "todos" },
      ...categories.map((category) => ({
        label: category,
        value: category,
      })),
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = filter === "todos" || item.category === filter;
      const matchesStatus =
        statusFilter === "todos" || statusOfItem(item) === statusFilter;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [items, search, filter, statusFilter]);

  async function confirmDelete() {
    if (!deletingItem) return;
    const item = deletingItem;
    try {
      await deleteStockItem.mutateAsync(item.id);
      if (editingItem?.id === item.id) setEditingItem(null);
      if (lotsItem?.id === item.id) setLotsItem(null);
      if (movementItem?.id === item.id) setMovementItem(null);
      setDeletingItem(null);
    } catch {
      // Erro exibido dentro do ConfirmDialog
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Estoque de insumos"
        description="Controle saldos, lotes com validade (FEFO) e entradas ou baixas da cozinha."
        actions={
          <>
            <Link
              href="/relatorios/estoque"
              className="border-input bg-card text-foreground hover:bg-muted inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-colors"
            >
              <BarChart3 className="size-4" />
              Relatório e perdas
            </Link>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Novo item
            </Button>
          </>
        }
      />

      <StatCards activeStatus={statusFilter} onStatusChange={setStatusFilter} />

      <section className="border-border bg-card overflow-hidden rounded-2xl border">
        {/* Barra de busca e filtros */}
        <div className="border-border flex flex-col gap-3 border-b p-4 lg:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar insumo..."
                className="border-input bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-primary/15 h-10 w-full rounded-lg border pr-3 pl-9 text-sm transition-colors outline-none focus:ring-4"
              />
            </div>

            {statusFilter !== "todos" || filter !== "todos" || search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("todos");
                  setStatusFilter("todos");
                }}
                className="text-primary hover:text-primary/80 self-start text-xs font-semibold sm:self-auto"
              >
                Limpar filtros
              </button>
            ) : null}
          </div>

          <div className="-mx-1 flex scrollbar-thin gap-1.5 overflow-x-auto px-1 pb-0.5">
            {filters.map((item) => {
              const active = filter === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-border bg-muted/40 text-muted-foreground border-b text-left text-xs">
                <th className="px-5 py-3 font-medium">Insumo</th>
                <th className="px-5 py-3 font-medium">Categoria</th>
                <th className="px-5 py-3 font-medium">Saldo e mínimo</th>
                <th className="px-5 py-3 font-medium">Situação</th>
                <th className="px-5 py-3 text-right font-medium">Operações</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/35 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-foreground font-semibold">{item.name}</p>
                    <p className="text-muted-foreground tabular text-xs">
                      {formatBRL(item.unitCost)} / {item.unit} · total{" "}
                      {formatBRL(item.currentQuantity * item.unitCost)}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StockLevel item={item} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={statusOfItem(item)} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMovementItem(item)}
                      >
                        <ArrowLeftRight className="size-3.5" />
                        Movimentar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLotsItem(item)}
                      >
                        <CalendarClock className="size-3.5" />
                        Lotes
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${item.name}`}
                        onClick={() => setEditingItem(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir ${item.name}`}
                        disabled={deleteStockItem.isPending}
                        onClick={() => {
                          deleteStockItem.reset();
                          setDeletingItem(item);
                        }}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="divide-border divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-1.5 h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <EmptyState
              icon={Boxes}
              title="Não foi possível carregar o estoque"
              description="Tente novamente em instantes."
            />
          )}

          {!isLoading && !isError && filteredItems.length === 0 && (
            <EmptyState
              icon={Boxes}
              title="Nenhum insumo encontrado"
              description="Ajuste a busca, troque a categoria ou cadastre um novo item."
            />
          )}
        </div>

        <div className="border-border text-muted-foreground flex items-center justify-between border-t px-5 py-3 text-xs">
          <span>
            Exibindo {filteredItems.length} de {items.length}{" "}
            {items.length === 1 ? "item" : "itens"}
          </span>
        </div>
      </section>

      <CreateStockItemDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EditStockItemDialog
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />
      <StockItemLotsDialog item={lotsItem} onClose={() => setLotsItem(null)} />
      {movementItem ? (
        <RegisterMovementDialog
          key={movementItem.id}
          item={movementItem}
          onClose={() => setMovementItem(null)}
        />
      ) : null}

      <ConfirmDialog
        open={deletingItem !== null}
        title="Excluir este insumo?"
        description={
          deletingItem
            ? `O item "${deletingItem.name}" sairá do cadastro e das fichas técnicas de produtos.`
            : ""
        }
        confirmLabel="Excluir insumo"
        cancelLabel="Cancelar"
        tone="destructive"
        pending={deleteStockItem.isPending}
        error={
          deleteStockItem.isError
            ? getApiErrorMessage(
                deleteStockItem.error,
                "Não foi possível excluir o item.",
              )
            : null
        }
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
}
