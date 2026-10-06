"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { CreateStoreDialog } from "@/modules/stores/components/create-store-dialog";
import { StoreDetailDialog } from "@/modules/stores/components/store-detail-dialog";
import { StoreStatusBadge } from "@/modules/stores/components/store-status-badge";
import { useKnownStores } from "@/modules/stores/hooks/use-stores";
import { formatStoreHours } from "@/modules/stores/lib/time";
import type { Store } from "@/modules/stores/types/store";

export function StoresPanel() {
  const { stores, isLoading, isError } = useKnownStores();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredStores = useMemo(() => {
    const term = search.toLowerCase().trim();
    return stores.filter((store) => {
      if (!term) return true;
      return (
        store.name.toLowerCase().includes(term) ||
        store.addressCity.toLowerCase().includes(term)
      );
    });
  }, [stores, search]);

  const selectedStore =
    stores.find((store) => store.id === selectedId) ?? null;

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
                placeholder="Buscar loja..."
                className="border-input bg-background placeholder:text-muted-foreground focus:border-ring focus:ring-ring/30 h-10 w-full rounded-lg border pr-3 pl-9 text-sm transition-colors outline-none focus:ring-2"
              />
            </div>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova loja
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            A API ainda não lista todas as lojas. Esta tela busca as unidades
            conhecidas (seed 1 e 2, quando existirem) e as lojas cadastradas
            nesta sessão.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
                <th className="px-5 py-3 font-medium">Loja</th>
                <th className="px-5 py-3 font-medium">Cidade</th>
                <th className="px-5 py-3 font-medium">Horário</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((store) => (
                <StoreRow
                  key={store.id}
                  store={store}
                  onOpen={() => setSelectedId(store.id)}
                />
              ))}
            </tbody>
          </table>

          {isLoading ? (
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <tbody>
                {Array.from({ length: 2 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-border border-b last:border-0"
                  >
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="mt-1.5 h-3 w-24" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-6 w-24 rounded-sm" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {isError ? (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-foreground font-medium">
                Não foi possível carregar as lojas
              </p>
              <p className="text-muted-foreground text-sm">
                Tente novamente em instantes.
              </p>
            </div>
          ) : null}

          {!isLoading && !isError && filteredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-foreground font-medium">
                Nenhuma loja encontrada
              </p>
              <p className="text-muted-foreground text-sm">
                Cadastre uma unidade ou confira se o seed das lojas 1 e 2 está
                no backend.
              </p>
            </div>
          ) : null}
        </div>

        <div className="border-border text-muted-foreground flex items-center justify-between border-t px-5 py-3 text-sm">
          <span>
            {filteredStores.length}{" "}
            {filteredStores.length === 1 ? "loja" : "lojas"}
          </span>
        </div>
      </section>
      <CreateStoreDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <StoreDetailDialog
        store={selectedStore}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}

function StoreRow({ store, onOpen }: { store: Store; onOpen: () => void }) {
  return (
    <tr className="border-border hover:bg-muted/40 border-b transition-colors last:border-0">
      <td className="px-5 py-4">
        <p className="text-foreground font-medium">{store.name}</p>
        <p className="text-muted-foreground text-xs">
          {store.addressNeighborhood}
        </p>
      </td>
      <td className="px-5 py-4">{store.addressCity}</td>
      <td className="px-5 py-4">
        {formatStoreHours(store.openingTime, store.closingTime)}
      </td>
      <td className="px-5 py-4">
        <StoreStatusBadge store={store} />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end">
          <button
            type="button"
            aria-label={`Ver detalhes de ${store.name}`}
            onClick={onOpen}
            className="border-border text-muted-foreground hover:border-primary/40 hover:text-primary flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
