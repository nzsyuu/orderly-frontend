import { Suspense } from "react";
import { AuthPage } from "@/modules/auth/components/auth-page";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";

export default function PasswordResetValidatePage() {
  return (
    <AuthPage>
      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">Carregando...</p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthPage>
  );
}
