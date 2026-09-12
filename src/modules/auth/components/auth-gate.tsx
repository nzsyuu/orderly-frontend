"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/modules/auth/hooks/use-auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isError) {
      router.replace("/login");
    }
  }, [router, session.isError]);

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Carregando sessão...</p>
      </div>
    );
  }

  if (session.isError || !session.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Redirecionando...</p>
      </div>
    );
  }

  return children;
}
