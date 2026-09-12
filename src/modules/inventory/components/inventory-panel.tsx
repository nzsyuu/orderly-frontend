"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Minus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  useDeleteStockItem,
  useRegisterMovement,
  useStockItems,
} from "@/modules/inventory/hooks/use-stock-items";
import { CreateStockItemDialog } from "@/modules/inventory/components/create-stock-item-dialog";
import { EditStockItemDialog } from "@/modules/inventory/components/edit-stock-item-dialog";
import { getApiErrorMessage } from "@/shared/http/api-error";
import {
  statusOfItem,
  type StockItem,
  type StockStatus,
} from "@/modules/inventory/types/stock-item";
import { stockCategoryOptions } from "@/modules/inventory/schemas/stock-item-form";
import { formatBRL } from "@/shared/lib/format";

const statusConfig: Record<
  StockStatus,
  { label: string; className: string; dot: string }
> = {
  ok: {
    label: "Em estoque",
    className: "bg-success/15 text-success",
    dot: "bg-success",
  },
  baixo: {
    label: "Estoque baixo",
    className: "bg-warning/15 text-warning",
    dot: "bg-warning",
  },
  esgotado: {
    label: "Esgotado",
    className: "bg-destructive/15 text-destructive",
    dot: "bg-destructive",
  },
};

function StatusBadge({ status }: { status: StockStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium ${cfg.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
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
        <span className="text-foreground font-medium">
          {item.currentQuantity}
        </span>
        <span className="text-muted-foreground text-xs">
          {item.unit} · mín. {item.minimumStock}
        </span>
      </div>
      <div className="bg-muted h-1.5 w-28 overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function InventoryPanel() {
  const { data: items = [], isLoading, isError } = useStockItems();
  const registerMovement = useRegisterMovement();
  const deleteStockItem = useDeleteStockItem();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filters = useMemo(() => {
    const extras = items.map((item) => item.category);
    const categories = [...new Set([...stockCategoryOptions(), ...extras])];
    return [
      { label: "Todos", value: "todos" },
      ...categories.map((category) => ({
        label: category,
        value: category,
      })),
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = filter === "todos" || item.category === filter;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [items, search, filter]);

  async function handleDelete(item: StockItem) {
    const confirmed = window.confirm(
      `Excluir o item "${item.name}"? Ele sai do cadastro e das receitas.`,
    );
    if (!confirmed) return;

    setActionError(null);
    try {
      await deleteStockItem.mutateAsync(item.id);
      if (editingItem?.id === item.id) {
        setEditingItem(null);
      }
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Não foi possível excluir o item."),
      );
    }
  }

  async function handleMovement(item: StockItem, type: "ENTRADA" | "SAIDA") {
    setActionError(null);
    try {
      await registerMovement.mutateAsync({
        id: item.id,
        input: {
          type,
          quantity: 1,
          reason: "Ajuste manual",
        },
      });
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Não foi possível registrar a movimentação."),
      );
    }
  }

  return (
    <>
      <section className="border-border bg-card rounded-md border">
        <div className="border-border flex flex-col gap-4 border-b p-4 lg:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar item..."
                className="border-input bg-background placeholder:text-muted-foreground focus:border-ring focus:ring-ring/30 h-10 w-full rounded-lg border pr-3 pl-9 text-sm transition-colors outline-none focus:ring-2"
              />
            </div>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo item
            </Button>
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`shrink-0 rounded-sm px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  filter === item.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {actionError && (
          <p className="text-destructive border-border border-b px-5 py-3 text-sm">
            {actionError}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-5 py-3 font-medium">Categoria</th>
                <th className="px-5 py-3 font-medium">Quantidade</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-border hover:bg-muted/40 border-b transition-colors last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="text-foreground font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatBRL(item.unitCost)} / {item.unit}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StockLevel item={item} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={statusOfItem(item)} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        aria-label={`Editar ${item.name}`}
                        onClick={() => setEditingItem(item)}
                        className="border-border text-muted-foreground hover:border-primary/40 hover:text-primary flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Excluir ${item.name}`}
                        disabled={deleteStockItem.isPending}
                        onClick={() => void handleDelete(item)}
                        className="border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Registrar saída de ${item.name}`}
                        disabled={registerMovement.isPending}
                        onClick={() => void handleMovement(item, "SAIDA")}
                        className="border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Registrar entrada de ${item.name}`}
                        disabled={registerMovement.isPending}
                        onClick={() => void handleMovement(item, "ENTRADA")}
                        className="border-border text-muted-foreground hover:border-primary/40 hover:text-primary flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-foreground font-medium">
                Carregando estoque...
              </p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-foreground font-medium">
                Não foi possível carregar o estoque
              </p>
              <p className="text-muted-foreground text-sm">
                Tente novamente em instantes.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-foreground font-medium">
                Nenhum item encontrado
              </p>
              <p className="text-muted-foreground text-sm">
                Tente ajustar a busca ou o filtro de categoria.
              </p>
            </div>
          )}
        </div>

        <div className="border-border text-muted-foreground flex items-center justify-between border-t px-5 py-3 text-sm">
          <span>
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "itens"}
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
    </>
  );
}
