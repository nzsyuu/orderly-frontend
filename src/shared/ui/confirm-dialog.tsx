"use client";

import { Loader2 } from "lucide-react";
import { Modal } from "@/shared/ui/modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: "default" | "destructive";
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "default",
  pending = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const confirmClassName =
    tone === "destructive"
      ? "bg-destructive text-white hover:bg-destructive/90"
      : "bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <Modal open={open} title={title} subtitle={description} onClose={onClose}>
      {error && (
        <p className="text-destructive bg-destructive/10 mt-4 rounded-lg px-3 py-2 text-xs font-medium">
          {error}
        </p>
      )}
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="border-border text-muted-foreground hover:bg-muted focus-visible:ring-ring/50 flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={`focus-visible:ring-ring/50 flex flex-[1.4] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 disabled:opacity-50 ${confirmClassName}`}
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
