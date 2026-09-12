"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/modules/auth/hooks/use-auth";
import { AuthPage } from "@/modules/auth/components/auth-page";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function LoginPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.data) {
      router.replace("/estoque");
    }
  }, [router, session.data]);

  return (
    <AuthPage>
      <LoginForm />
    </AuthPage>
  );
}
