"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  BarChart3,
  Boxes,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Warehouse,
  X,
} from "lucide-react";
import { CreateStockItemDialog } from "@/modules/inventory/components/create-stock-item-dialog";
import { EditStockItemDialog } from "@/modules/inventory/components/edit-stock-item-dialog";
import { RegisterMovementDialog } from "@/modules/inventory/components/register-movement-dialog";
import { StatCards } from "@/modules/inventory/components/stat-cards";
import { StockItemLotsDialog } from "@/modules/inventory/components/stock-item-lots-dialog";
import {
  useDeleteStockItem,
  useStockItemsByStock,
  useStocks,
} from "@/modules/inventory/hooks/use-stock-items";
import { stockCategoryOptions } from "@/modules/inventory/schemas/stock-item-form";
import {
  statusOfItem,
  type ListStockItemsParams,
  type StockItem,
  type StockStatus,
} from "@/modules/inventory/types/stock-item";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { formatBRL, formatNumber } from "@/shared/lib/format";
import { useDebounce } from "@/shared/lib/use-debounce";
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

function parseInitialActive(
  raw: string | null,
): "todos" | "ativos" | "inativos" {
  if (raw === "ativos" || raw === "true") return "ativos";
  if (raw === "inativos" || raw === "false") return "inativos";
  return "todos";
}

function getPaginationRange(
  currentPage: number,
  totalPages: number,
): (number | "dots")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | "dots")[] = [0];

  if (currentPage > 2) {
    pages.push("dots");
  }

  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 3) {
    pages.push("dots");
  }

  pages.push(totalPages - 1);
  return pages;
}

export function InventoryPanel() {
  const searchParams = useSearchParams();

  // Depósitos disponíveis
  const stocksQuery = useStocks();
  const stocks = useMemo(() => stocksQuery.data ?? [], [stocksQuery.data]);

  const initialStockId = searchParams.get("deposito")
    ? Number(searchParams.get("deposito"))
    : null;
  const [userSelectedStockId, setUserSelectedStockId] = useState<number | null>(
    initialStockId,
  );

  const selectedStockId =
    userSelectedStockId ?? (stocks.length > 0 ? stocks[0].id : null);

  // Estados dos filtros e paginação
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const debouncedSearch = useDebounce(search, 300);

  const [filter, setFilter] = useState(
    () => searchParams.get("categoria") ?? "todos",
  );
  const [activeFilter, setActiveFilter] = useState<
    "todos" | "ativos" | "inativos"
  >(() => parseInitialActive(searchParams.get("ativo")));

  const [statusFilter, setStatusFilter] = useState<StockStatus | "todos">(() =>
    parseInitialStatus(searchParams.get("status")),
  );

  const [page, setPage] = useState(() => {
    const rawPage = Number(searchParams.get("page"));
    return Number.isInteger(rawPage) && rawPage > 0 ? rawPage - 1 : 0;
  });

  const [size, setSize] = useState(() => {
    const rawSize = Number(searchParams.get("size"));
    return [10, 20, 50].includes(rawSize) ? rawSize : 10;
  });

  // Diálogos modais
  const [createOpen, setCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [lotsItem, setLotsItem] = useState<StockItem | null>(null);
  const [movementItem, setMovementItem] = useState<StockItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<StockItem | null>(null);

  const deleteStockItem = useDeleteStockItem();

  // Opções de categorias para os pills de filtro
  const categories = useMemo(() => {
    return [
      { label: "Todas", value: "todos" },
      ...stockCategoryOptions().map((category) => ({
        label: category,
        value: category,
      })),
    ];
  }, []);

  // Parâmetros para a API conforme CONTRATO-API-ESTOQUE.md
  const apiParams: ListStockItemsParams = useMemo(() => {
    return {
      page,
      size,
      name: debouncedSearch.trim() || undefined,
      category: filter === "todos" ? undefined : filter,
      active:
        activeFilter === "ativos"
          ? true
          : activeFilter === "inativos"
            ? false
            : undefined,
    };
  }, [page, size, debouncedSearch, filter, activeFilter]);

  // Consulta paginada ao endpoint /api/stocks/{stockId}/items
  const {
    data: pagedData,
    isLoading,
    isFetching,
    isError,
  } = useStockItemsByStock(selectedStockId, apiParams);

  const items = useMemo(() => pagedData?.content ?? [], [pagedData]);
  const totalElements = pagedData?.totalElements ?? 0;
  const totalPages = pagedData?.totalPages ?? 0;
  const isFirst = pagedData?.isFirst ?? page === 0;
  const last = pagedData?.last ?? (totalPages <= 1 || page >= totalPages - 1);

  // Filtro secundário por situação de estoque ("ok" | "baixo" | "esgotado") acionado pelos StatCards
  const displayedItems = useMemo(() => {
    if (statusFilter === "todos") return items;
    return items.filter((item) => statusOfItem(item) === statusFilter);
  }, [items, statusFilter]);

  // Sincronização limpa dos parâmetros com a URL (sem recarregar a página)
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedStockId && stocks.length > 1) {
      params.set("deposito", String(selectedStockId));
    }
    if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
    if (filter !== "todos") params.set("categoria", filter);
    if (activeFilter !== "todos") params.set("ativo", activeFilter);
    if (statusFilter !== "todos") params.set("status", statusFilter);
    if (page > 0) params.set("page", String(page + 1));
    if (size !== 10) params.set("size", String(size));

    const qs = params.toString();
    const newPath = qs ? `/estoque?${qs}` : "/estoque";
    window.history.replaceState(null, "", newPath);
  }, [
    selectedStockId,
    debouncedSearch,
    filter,
    activeFilter,
    statusFilter,
    page,
    size,
    stocks.length,
  ]);

  // Handlers que resetam para a primeira página ao alterar filtros
  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleFilterCategory(category: string) {
    setFilter(category);
    setPage(0);
  }

  function handleActiveFilterChange(value: "todos" | "ativos" | "inativos") {
    setActiveFilter(value);
    setPage(0);
  }

  function handleSizeChange(newSize: number) {
    setSize(newSize);
    setPage(0);
  }

  function handleClearFilters() {
    setSearch("");
    setFilter("todos");
    setActiveFilter("todos");
    setStatusFilter("todos");
    setPage(0);
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    filter !== "todos" ||
    activeFilter !== "todos" ||
    statusFilter !== "todos";

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

  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);
  const paginationRange = getPaginationRange(page, totalPages);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Estoque de insumos"
        description="Controle saldos, lotes com validade (FEFO) e entradas ou baixas da cozinha com busca e paginação em tempo real."
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

      {/* Seletor de Depósito / Estoque (quando houver múltiplos) */}
      {stocks.length > 1 && (
        <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-2xl border p-2.5">
          <div className="text-muted-foreground flex items-center gap-2 px-2 text-xs font-semibold">
            <Warehouse className="size-4" />
            <span>Depósito ativo:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stocks.map((stock) => {
              const isSelected = selectedStockId === stock.id;
              return (
                <button
                  key={stock.id}
                  type="button"
                  onClick={() => {
                    setUserSelectedStockId(stock.id);
                    setPage(0);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {stock.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Indicadores numéricos consolidados */}
      <StatCards
        activeStatus={statusFilter}
        onStatusChange={(status) => {
          setStatusFilter(status);
          setPage(0);
        }}
        stockId={selectedStockId}
      />

      {/* Seção principal: Tabela, busca, filtros e paginação */}
      <section className="border-border bg-card overflow-hidden rounded-2xl border">
        {/* Barra superior de busca e controles */}
        <div className="border-border flex flex-col gap-3.5 border-b p-4 lg:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Campo de busca textual com debounce */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar insumo por nome..."
                aria-label="Buscar insumo por nome"
                className="border-input bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-primary/15 h-10 w-full rounded-lg border pr-9 pl-9 text-sm transition-colors outline-none focus:ring-4"
              />
              {isFetching && search.trim() !== "" ? (
                <Loader2 className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
              ) : search ? (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label="Limpar busca"
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filtro de Ativos / Inativos */}
              <div className="bg-muted flex items-center rounded-lg p-0.5">
                {(
                  [
                    { label: "Todos", value: "todos" },
                    { label: "Ativos", value: "ativos" },
                    { label: "Inativos", value: "inativos" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleActiveFilterChange(opt.value)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                      activeFilter === opt.value
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Botão para limpar filtros caso algum esteja aplicado */}
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold"
                >
                  <X className="size-3.5" />
                  Limpar filtros
                </button>
              ) : null}
            </div>
          </div>

          {/* Filtro horizontal de categorias */}
          <div className="-mx-1 flex scrollbar-thin gap-1.5 overflow-x-auto px-1 pb-0.5">
            {categories.map((item) => {
              const active = filter === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleFilterCategory(item.value)}
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

          {/* Aviso contextual quando o filtro de situação dos cards estiver restringindo os itens da página */}
          {statusFilter !== "todos" && (
            <div className="border-border bg-muted/40 flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="text-warning size-3.5" />
                Filtrando visualização por situação:{" "}
                <strong className="text-foreground font-semibold">
                  {statusConfig[statusFilter].label}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setStatusFilter("todos")}
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Remover restrição
              </button>
            </div>
          )}
        </div>

        {/* Tabela de dados de insumos */}
        <div className="relative overflow-x-auto">
          <table
            className={cn(
              "w-full min-w-[720px] border-collapse text-sm transition-opacity",
              isFetching && !isLoading && "opacity-60",
            )}
          >
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
              {displayedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/35 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground font-semibold">
                        {item.name}
                      </p>
                      {!item.active && (
                        <span className="border-border bg-muted text-muted-foreground rounded border px-1.5 py-0.5 text-[10px] font-semibold">
                          Inativo
                        </span>
                      )}
                    </div>
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

          {/* Skeletons durante carregamento inicial */}
          {isLoading && (
            <div className="divide-border divide-y">
              {Array.from({ length: size > 10 ? 8 : 5 }).map((_, i) => (
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

          {/* Erro de carregamento */}
          {isError && (
            <EmptyState
              icon={Boxes}
              title="Não foi possível carregar o estoque"
              description="Verifique a conexão ou se o depósito está disponível e tente novamente."
            />
          )}

          {/* Estado vazio para depósitos sem nenhum insumo */}
          {!isLoading &&
            !isError &&
            totalElements === 0 &&
            !hasActiveFilters && (
              <EmptyState
                icon={Boxes}
                title="Depósito vazio"
                description="Nenhum insumo foi cadastrado neste depósito ainda. Cadastre o primeiro item para iniciar o controle."
                action={
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4" />
                    Cadastrar insumo
                  </Button>
                }
              />
            )}

          {/* Estado vazio quando busca ou filtros não encontram registros */}
          {!isLoading &&
            !isError &&
            (totalElements === 0 || displayedItems.length === 0) &&
            hasActiveFilters && (
              <EmptyState
                icon={Boxes}
                title="Nenhum insumo encontrado"
                description="Não encontramos nenhum item correspondente aos critérios de busca ou filtros aplicados."
                action={
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpar busca e filtros
                  </Button>
                }
              />
            )}
        </div>

        {/* Rodapé com informações de paginação e controles */}
        <div className="border-border text-muted-foreground flex flex-col gap-3 border-t px-5 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span>
              Exibindo{" "}
              <strong className="text-foreground font-semibold">
                {startItem}–{endItem}
              </strong>{" "}
              de{" "}
              <strong className="text-foreground font-semibold">
                {totalElements}
              </strong>{" "}
              {totalElements === 1 ? "insumo" : "insumos"}
            </span>

            {/* Seletor de registros por página */}
            <div className="border-border flex items-center gap-1.5 border-l pl-3">
              <label
                htmlFor="stock-page-size"
                className="text-muted-foreground"
              >
                Por pág.:
              </label>
              <select
                id="stock-page-size"
                value={size}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="border-input bg-background text-foreground focus:border-primary focus:ring-primary/15 h-7 rounded-md border px-1.5 text-xs font-semibold outline-none focus:ring-2"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Controles de navegação da paginação */}
          {totalPages > 1 && (
            <nav
              aria-label="Paginação do estoque"
              className="flex items-center gap-1"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isFirst || isFetching}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                aria-label="Página anterior"
                className="h-8 gap-1 px-2.5 text-xs"
              >
                <ChevronLeft className="size-3.5" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>

              <div className="flex items-center gap-1">
                {paginationRange.map((p, idx) => {
                  if (p === "dots") {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="text-muted-foreground px-1.5 text-xs"
                      >
                        …
                      </span>
                    );
                  }

                  const isCurrent = p === page;
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={isFetching}
                      onClick={() => setPage(p)}
                      aria-label={`Ir para a página ${p + 1}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border-input bg-card text-foreground hover:bg-muted border",
                      )}
                    >
                      {p + 1}
                    </button>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={last || isFetching}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                aria-label="Próxima página"
                className="h-8 gap-1 px-2.5 text-xs"
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </nav>
          )}
        </div>
      </section>

      {/* Diálogos modais */}
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
