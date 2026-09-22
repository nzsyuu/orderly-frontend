"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChefHat } from "lucide-react";
import { useProducts } from "@/modules/products/hooks/use-products";
import { useSession } from "@/modules/auth/hooks/use-auth";
import { useAddToCart } from "@/modules/cart/hooks/use-cart";
import { CatalogNavbar } from "@/modules/catalog/components/catalog-navbar";
import { ProductCard } from "@/modules/catalog/components/product-card";
import { CartDrawer } from "@/modules/catalog/components/cart-drawer";
import { ProductModal } from "@/modules/catalog/components/product-modal";
import type { Product } from "@/modules/products/types/product";

export function CatalogPage() {
  const router = useRouter();
  const session = useSession();
  const isLoggedIn = !!session.data;
  const products = useProducts();
  const addToCart = useAddToCart();

  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const activeProducts = (products.data ?? []).filter((p) => p.active);

  const filteredProducts = search.trim()
    ? activeProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : activeProducts;

  function handleAddToCart(product: Product) {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setAddingId(product.id);
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSettled: () => {
          setAddingId(null);
          setCartOpen(true); // Auto open cart after quick add
        },
      },
    );
  }

  function handleAddFromModal(productId: number, quantity: number, observation: string) {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setAddingId(productId);
    addToCart.mutate(
      { productId, quantity, observation: observation.trim() || undefined },
      {
        onSettled: () => {
          setAddingId(null);
          setSelectedProductId(null); // Close modal
          setCartOpen(true); // Open cart to show success
        },
      },
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <CatalogNavbar onCartClick={() => setCartOpen(true)} />

      {/* Hero */}
      <section className="border-border border-b">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-accent text-accent-foreground flex h-10 w-10 items-center justify-center rounded-lg">
              <ChefHat className="h-5 w-5" />
            </div>
            <h1 className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Bem-vindo à Orderly!
            </h1>
          </div>
          <p className="text-muted-foreground max-w-lg text-sm sm:text-base">
            Peça já o seu hambúrguer artesanal e aproveite cada mordida saborosa.
            Confira nosso cardápio e monte o seu pedido.
          </p>
        </div>
      </section>

      {/* Search & Product Grid */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-input bg-card focus:border-ring focus:ring-ring/30 h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none focus:ring-2"
            />
          </div>
        </div>

        {/* Loading */}
        {products.isPending && (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground text-sm">Carregando cardápio...</p>
          </div>
        )}

        {/* Error */}
        {products.isError && (
          <div className="flex items-center justify-center py-20">
            <p className="text-destructive text-sm">Não foi possível carregar o cardápio.</p>
          </div>
        )}

        {/* Empty state */}
        {products.isSuccess && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-muted-foreground text-sm font-medium">
              {search.trim()
                ? "Nenhum produto encontrado para sua busca."
                : "Nenhum produto disponível no momento."}
            </p>
          </div>
        )}

        {/* Product Grid */}
        {products.isSuccess && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={(p) => setSelectedProductId(p.id)}
                onAddToCart={handleAddToCart}
                isAdding={addingId === product.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-border border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-muted-foreground text-center text-xs">
            © {new Date().getFullYear()} Orderly Burgueria — Feito com ❤ para você.
          </p>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      
      <ProductModal 
        key={selectedProductId || 'modal'}
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
        onAddToCart={handleAddFromModal}
        isAdding={addingId === selectedProductId}
      />
    </div>
  );
}
