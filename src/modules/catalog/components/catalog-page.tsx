"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UtensilsCrossed } from "lucide-react";
import { useSession } from "@/modules/auth/hooks/use-auth";
import {
  useAddToCart,
  useCart,
  useUpdateCartItem,
} from "@/modules/cart/hooks/use-cart";
import { CartDrawer } from "@/modules/catalog/components/cart-drawer";
import { CatalogNavbar } from "@/modules/catalog/components/catalog-navbar";
import {
  CategoryNav,
  sectionId,
} from "@/modules/catalog/components/category-nav";
import { ProductCard } from "@/modules/catalog/components/product-card";
import { ProductModal } from "@/modules/catalog/components/product-modal";
import { groupProductsByCategory } from "@/modules/catalog/lib/categories";
import { ActiveOrderBanner } from "@/modules/orders/components/active-order-banner";
import { useActiveOrders } from "@/modules/orders/hooks/use-orders";
import { useProducts } from "@/modules/products/hooks/use-products";
import type { Product } from "@/modules/products/types/product";
import { StoreClosedBanner } from "@/modules/stores/components/store-closed-banner";
import { useStore } from "@/modules/stores/hooks/use-stores";
import { EmptyState } from "@/shared/ui/page";
import { Skeleton } from "@/shared/ui/skeleton";

export function CatalogPage() {
  const router = useRouter();
  const session = useSession();
  const isLoggedIn = !!session.data;
  const products = useProducts();
  const store = useStore();
  const canOrder = !store.data || store.data.status === "ABERTA";
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const cart = useCart(isLoggedIn);
  const { activeOrders } = useActiveOrders(isLoggedIn);
  const hasActiveOrders = activeOrders.length > 0;

  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  const activeProducts = (products.data ?? []).filter((p) => p.active);

  const filteredProducts = search.trim()
    ? activeProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : activeProducts;

  const groups = groupProductsByCategory(filteredProducts);

  function handleAddToCart(product: Product) {
    if (!canOrder) return;
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setAddingId(product.id);
    const existingItem = cart.data?.items.find(
      (i) => i.productId === product.id,
    );

    if (existingItem) {
      updateCartItem.mutate(
        {
          productId: product.id,
          input: { quantity: existingItem.quantity + 1 },
        },
        {
          onSettled: () => {
            setAddingId(null);
            setCartOpen(true);
          },
        },
      );
    } else {
      addToCart.mutate(
        { productId: product.id, quantity: 1 },
        {
          onSettled: () => {
            setAddingId(null);
            setCartOpen(true);
          },
        },
      );
    }
  }

  function handleAddFromModal(
    productId: number,
    quantity: number,
    observation: string,
  ) {
    if (!canOrder) return;
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setAddingId(productId);
    const existingItem = cart.data?.items.find(
      (i) => i.productId === productId,
    );

    if (existingItem) {
      updateCartItem.mutate(
        { productId, input: { quantity: existingItem.quantity + quantity } },
        {
          onSettled: () => {
            setAddingId(null);
            setSelectedProductId(null);
            setCartOpen(true);
          },
        },
      );
    } else {
      addToCart.mutate(
        { productId, quantity, observation: observation.trim() || undefined },
        {
          onSettled: () => {
            setAddingId(null);
            setSelectedProductId(null);
            setCartOpen(true);
          },
        },
      );
    }
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <CatalogNavbar onCartClick={() => setCartOpen(true)} />
      <StoreClosedBanner store={store.data} />

      {/* Letreiro de abertura com busca integrada */}
      <section className="bg-sidebar text-sidebar-foreground border-sidebar-border border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-11 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h1 className="font-condensed text-sidebar-foreground text-3xl leading-[1.02] font-extrabold sm:text-5xl">
              Da chapa quente direto para a sua porta.
            </h1>
            <p className="text-sidebar-foreground/75 mt-2.5 text-sm sm:text-base">
              Hambúrgueres artesanais, batatas crocantes e shakes batidos na
              hora. Escolha seus favoritos e acompanhe o preparo ao vivo.
            </p>
          </div>

          <div className="w-full max-w-sm">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar lanche ou ingrediente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card text-foreground placeholder:text-muted-foreground focus:ring-brand/40 h-11 w-full rounded-xl pr-3 pl-10 text-sm outline-none focus:ring-4"
              />
            </div>
          </div>
        </div>
      </section>

      {products.isSuccess && groups.length > 0 && (
        <CategoryNav categories={groups.map((g) => g.category)} />
      )}

      {/* Grade do cardápio */}
      <main
        className={`mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 ${hasActiveOrders ? "pb-24" : ""}`}
      >
        {products.isPending && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-border bg-card flex flex-col overflow-hidden rounded-2xl border"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="flex flex-1 flex-col p-5">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-2/3" />
                  <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-10 w-28 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.isError && (
          <EmptyState
            icon={UtensilsCrossed}
            title="Não foi possível carregar o cardápio"
            description="Verifique a conexão e atualize a página."
          />
        )}

        {products.isSuccess && filteredProducts.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            title={
              search.trim()
                ? "Nenhum item encontrado para sua busca"
                : "Cardápio indisponível no momento"
            }
            description={
              search.trim()
                ? "Tente buscar por outro nome ou ingrediente."
                : "Volte em instantes para conferir nossas opções."
            }
          />
        )}

        {products.isSuccess && groups.length > 0 && (
          <div className="flex flex-col gap-10">
            {groups.map(({ category, products: items }) => (
              <section
                key={category.id}
                id={sectionId(category.id)}
                aria-labelledby={`${sectionId(category.id)}-title`}
                className="scroll-mt-36"
              >
                <div className="border-border mb-4 flex items-baseline justify-between border-b pb-2">
                  <h2
                    id={`${sectionId(category.id)}-title`}
                    className="font-condensed text-foreground text-2xl font-extrabold sm:text-3xl"
                  >
                    {category.label}
                  </h2>
                  <span className="text-muted-foreground tabular text-xs font-medium">
                    {items.length} {items.length === 1 ? "opção" : "opções"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={(p) => setSelectedProductId(p.id)}
                      onAddToCart={handleAddToCart}
                      isAdding={addingId === product.id}
                      disabled={!canOrder}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="border-border bg-card border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} {store.data?.name ?? "Orderly"}
          </span>
          <span>Preços e disponibilidade sujeitos ao estoque do turno.</span>
        </div>
      </footer>

      {isLoggedIn && <ActiveOrderBanner />}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <ProductModal
        key={selectedProductId || "modal"}
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
        onAddToCart={handleAddFromModal}
        isAdding={addingId === selectedProductId}
        disabled={!canOrder}
      />
    </div>
  );
}
