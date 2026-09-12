"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/shared/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-foreground text-lg font-bold">
        Algo deu errado
      </h1>
      <p className="text-muted-foreground max-w-md text-sm">
        Não foi possível carregar esta página. Tente de novo ou volte ao login.
      </p>
      <div className="flex gap-2">
        <Button type="button" onClick={reset}>
          Tentar de novo
        </Button>
        <Button
          type="button"
          variant="outline"
          className="bg-transparent"
          onClick={() => router.replace("/login")}
        >
          Ir para login
        </Button>
      </div>
    </div>
  );
}
