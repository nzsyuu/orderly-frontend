"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/modules/auth/hooks/use-auth";
import { AuthPage } from "@/modules/auth/components/auth-page";
import { RegisterForm } from "@/modules/auth/components/register-form";

export default function CadastroPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.data) {
      router.replace("/estoque");
    }
  }, [router, session.data]);

  return (
    <AuthPage>
      <RegisterForm />
    </AuthPage>
  );
}
