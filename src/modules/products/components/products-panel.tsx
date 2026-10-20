"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CookingPot,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import { CreateProductDialog } from "@/modules/products/components/create-product-dialog";
import { EditProductDialog } from "@/modules/products/components/edit-product-dialog";
import { ProductDrawer } from "@/modules/products/components/product-drawer";
import {
  ProductStatCards,
  type ProductStatusFilter,
} from "@/modules/products/components/stat-cards";
import {
  useDeleteProduct,
  useProducts,
} from "@/modules/products/hooks/use-products";
import type { Product } from "@/modules/products/types/product";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { formatBRL } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { EmptyState, PageHeader, Segmented } from "@/shared/ui/page";
import { Skeleton } from "@/shared/ui/skeleton";

const filters = [
  { label: "Todos", value: "todos" },
  { label: "Ativos", value: "ativos" },
  { label: "Inativos", value: "inativos" },
] as const;

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active ? "bg-success/12 text-success" : "bg-muted text-muted-foreground"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${active ? "bg-success" : "bg-muted-foreground"}`}
      />
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

export function ProductsPanel() {
  const { data: products = [], isLoading, isError } = useProducts();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductStatusFilter>("todos");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchesStatus =
        filter === "todos" ||
        (filter === "ativos" && product.active) ||
        (filter === "inativos" && !product.active);
      return matchesSearch && matchesStatus;
    });
  }, [products, search, filter]);

  async function confirmDelete() {
    if (!deletingProduct) return;
    const product = deletingProduct;
    try {
      await deleteProduct.mutateAsync(product.id);
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(null);
      }
      setDeletingProduct(null);
    } catch {
      // Erro exibido dentro do ConfirmDialog
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Catálogo e fichas técnicas"
        description="Gerencie os lanches do cardápio e clique em um item para montar sua receita com insumos do estoque."
        actions={
          <>
            <Link
              href="/relatorios/vendas"
              className="border-input bg-card text-foreground hover:bg-muted inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-colors"
            >
              <TrendingUp className="size-4" />
              Curva ABC
            </Link>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Novo produto
            </Button>
          </>
        }
      />

      <ProductStatCards filter={filter} onFilterChange={setFilter} />

      <section className="border-border bg-card overflow-hidden rounded-2xl border">
        <div className="border-border flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between lg:p-5">
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produto..."
              className="border-input bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-primary/15 h-10 w-full rounded-lg border pr-3 pl-9 text-sm transition-colors outline-none focus:ring-4"
            />
          </div>

          <Segmented<ProductStatusFilter>
            label="Filtrar por disponibilidade"
            options={filters}
            value={filter}
            onChange={setFilter}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-border bg-muted/40 text-muted-foreground border-b text-left text-xs">
                <th className="px-5 py-3 font-medium">Produto</th>
                <th className="px-5 py-3 font-medium">Preço de venda</th>
                <th className="px-5 py-3 font-medium">Disponibilidade</th>
                <th className="px-5 py-3 text-right font-medium">Operações</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-muted/35 cursor-pointer transition-colors"
                  onClick={() => setSelectedProduct(product)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="border-border bg-muted relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <UtensilsCrossed className="text-muted-foreground/50 size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-semibold">
                          {product.name}
                        </p>
                        {product.description ? (
                          <p className="text-muted-foreground max-w-md truncate text-xs">
                            {product.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="font-condensed tabular text-foreground px-5 py-3.5 text-lg font-extrabold">
                    {formatBRL(product.price)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge active={product.active} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedProduct(product);
                        }}
                      >
                        <CookingPot className="size-3.5" />
                        Receita
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${product.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingProduct(product);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir ${product.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteProduct.reset();
                          setDeletingProduct(product);
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
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-11 rounded-xl" />
                    <div>
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="mt-1.5 h-3 w-56" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <EmptyState
              icon={Package}
              title="Não foi possível carregar os produtos"
              description="Tente novamente em instantes."
            />
          )}

          {!isLoading && !isError && filteredProducts.length === 0 && (
            <EmptyState
              icon={Package}
              title="Nenhum produto encontrado"
              description="Ajuste a busca ou o filtro de disponibilidade."
            />
          )}
        </div>

        <div className="border-border text-muted-foreground flex items-center justify-between border-t px-5 py-3 text-xs">
          <span>
            Exibindo {filteredProducts.length} de {products.length}{" "}
            {products.length === 1 ? "produto" : "produtos"}
          </span>
        </div>
      </section>

      <CreateProductDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EditProductDialog
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSaved={(product) => {
          if (selectedProduct?.id === product.id) {
            setSelectedProduct(product);
          }
        }}
      />
      <ProductDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <ConfirmDialog
        open={deletingProduct !== null}
        title="Excluir este produto?"
        description={
          deletingProduct
            ? `O produto "${deletingProduct.name}" sairá do cardápio e sua receita será removida.`
            : ""
        }
        confirmLabel="Excluir produto"
        cancelLabel="Cancelar"
        tone="destructive"
        pending={deleteProduct.isPending}
        error={
          deleteProduct.isError
            ? getApiErrorMessage(
                deleteProduct.error,
                "Não foi possível excluir o produto.",
              )
            : null
        }
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeletingProduct(null)}
      />
    </div>
  );
}
