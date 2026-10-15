import { AuthPage } from "@/modules/auth/components/auth-page";
import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthPage>
      <ForgotPasswordForm />
    </AuthPage>
  );
}
