"use client";

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="border-border bg-card relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md border p-5 shadow-lg"
      >
        <h2 className="font-display text-foreground text-lg font-bold">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export const fieldClassName =
  "border-input bg-background focus:border-ring focus:ring-ring/30 h-10 rounded-lg border px-3 text-sm outline-none focus:ring-2";
