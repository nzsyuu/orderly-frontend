"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { formatBRL } from "@/shared/lib/format";
import { getApiErrorMessage } from "@/shared/http/api-error";
import {
  useDeleteProduct,
  useProducts,
} from "@/modules/products/hooks/use-products";
import type { Product } from "@/modules/products/types/product";
import { CreateProductDialog } from "@/modules/products/components/create-product-dialog";
import { EditProductDialog } from "@/modules/products/components/edit-product-dialog";
import { ProductDrawer } from "@/modules/products/components/product-drawer";
import { Skeleton } from "@/shared/ui/skeleton";

const filters = [
  { label: "Todos", value: "todos" },
  { label: "Ativos", value: "ativos" },
  { label: "Inativos", value: "inativos" },
] as const;

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium ${
        active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-muted-foreground"}`}
      />
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

export function ProductsPanel() {
  const { data: products = [], isLoading, isError } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<(typeof filters)[number]["value"]>("todos");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Excluir o produto "${product.name}"? Ele sai do cadastro e a receita é removida.`,
    );
    if (!confirmed) return;

    setActionError(null);
    try {
      await deleteProduct.mutateAsync(product.id);
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(null);
      }
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Não foi possível excluir o produto."),
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
                placeholder="Buscar produto..."
                className="border-input bg-background placeholder:text-muted-foreground focus:border-ring focus:ring-ring/30 h-10 w-full rounded-lg border pr-3 pl-9 text-sm transition-colors outline-none focus:ring-2"
              />
            </div>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo produto
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
                <th className="px-5 py-3 font-medium">Produto</th>
                <th className="px-5 py-3 font-medium">Preço</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-border hover:bg-muted/40 cursor-pointer border-b transition-colors last:border-0"
                  onClick={() => setSelectedProduct(product)}
                >
                  <td className="px-5 py-4">
                    <p className="text-foreground font-medium">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-muted-foreground max-w-md truncate text-xs">
                        {product.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">{formatBRL(product.price)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge active={product.active} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        aria-label={`Editar ${product.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingProduct(product);
                        }}
                        className="border-border text-muted-foreground hover:border-primary/40 hover:text-primary flex h-8 w-8 items-center justify-center rounded-lg border"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Excluir ${product.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDelete(product);
                        }}
                        className="border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive flex h-8 w-8 items-center justify-center rounded-lg border"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-border text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
                  <th className="px-5 py-3 font-medium">Produto</th>
                  <th className="px-5 py-3 font-medium">Preço</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-border border-b last:border-0">
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="mt-1.5 h-3 w-56" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-6 w-16 rounded-sm" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-foreground font-medium">
                Não foi possível carregar os produtos
              </p>
              <p className="text-muted-foreground text-sm">
                Tente novamente em instantes.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-foreground font-medium">
                Nenhum produto encontrado
              </p>
              <p className="text-muted-foreground text-sm">
                Tente ajustar a busca ou o filtro de status.
              </p>
            </div>
          )}
        </div>

        <div className="border-border text-muted-foreground flex items-center justify-between border-t px-5 py-3 text-sm">
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "produto" : "produtos"}
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
    </>
  );
}
