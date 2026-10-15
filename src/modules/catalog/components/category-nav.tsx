"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/modules/catalog/lib/categories";

type CategoryNavProps = {
  categories: readonly Category[];
};

export function sectionId(categoryId: string) {
  return `categoria-${categoryId}`;
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = categories
      .map((c) => document.getElementById(sectionId(c.id)))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    function update() {
      // Seção ativa = a última cujo topo já passou da barra fixa.
      // Maior que o scroll-mt-36 (144px) das seções, para que a seção
      // alvo de um clique já conte como ativa ao chegar.
      const threshold = 160;
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top - threshold <= 0) current = el.id;
      }
      // No fim da página a última seção pode não alcançar o topo.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = elements[elements.length - 1].id;
      setActiveId(current);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [categories]);

  function handleClick(event: React.MouseEvent, id: string) {
    event.preventDefault();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav
      aria-label="Categorias do cardápio"
      className="border-border bg-background/95 sticky top-16 z-30 border-b backdrop-blur"
    >
      <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
        {categories.map((category) => {
          const id = sectionId(category.id);
          const isActive = activeId === id;
          return (
            <li key={category.id} className="shrink-0">
              <a
                href={`#${id}`}
                onClick={(e) => handleClick(e, id)}
                aria-current={isActive ? "true" : undefined}
                className={`focus-visible:ring-ring/50 inline-flex h-9 items-center rounded-lg border px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {category.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
