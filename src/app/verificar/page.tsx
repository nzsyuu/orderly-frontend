"use client";

import { Suspense } from "react";
import { AuthPage } from "@/modules/auth/components/auth-page";
import { VerifyForm } from "@/modules/auth/components/verify-form";

export default function VerificarPage() {
  return (
    <AuthPage>
      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">Carregando...</p>
        }
      >
        <VerifyForm />
      </Suspense>
    </AuthPage>
  );
}
