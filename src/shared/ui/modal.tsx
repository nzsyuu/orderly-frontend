"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  wide?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({
  open,
  title,
  subtitle,
  wide = false,
  onClose,
  children,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        className="animate-fade-in absolute inset-0 bg-[#0f1a13]/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "bg-card animate-pop-in relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl p-5 shadow-[0_24px_60px_-20px_rgb(15_26_19/0.45)] outline-none sm:rounded-2xl sm:p-6",
          wide ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-condensed text-foreground text-2xl leading-tight font-bold"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground hover:bg-muted hover:text-foreground -mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const fieldClassName =
  "border-input bg-card text-foreground placeholder:text-muted-foreground/70 hover:border-foreground/30 focus:border-primary focus:ring-primary/15 h-11 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus:ring-4 disabled:opacity-60";
