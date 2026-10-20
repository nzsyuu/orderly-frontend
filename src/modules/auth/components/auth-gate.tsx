"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/modules/auth/hooks/use-auth";
import { getHomeRouteByRole, type UserRole } from "@/modules/auth/types/user";

type AuthGateProps = {
  children: React.ReactNode;
  requiredRole?: UserRole;
};

export function AuthGate({ children, requiredRole }: AuthGateProps) {
  const router = useRouter();
  const session = useSession();
  const user = session.data;
  const hasPermission = !requiredRole || user?.role === requiredRole;

  useEffect(() => {
    if (session.isError) {
      router.replace("/login");
      return;
    }

    if (user && !hasPermission) {
      router.replace(getHomeRouteByRole(user.role));
    }
  }, [hasPermission, router, session.isError, user]);

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Carregando sessão...</p>
      </div>
    );
  }

  if (session.isError || !user || !hasPermission) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Redirecionando...</p>
      </div>
    );
  }

  return children;
}
