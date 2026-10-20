"use client";

import { useState } from "react";
import { AuthGate } from "@/modules/auth/components/auth-gate";
import { Sidebar } from "@/modules/shell/components/sidebar";
import { Topbar } from "@/modules/shell/components/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGate requiredRole="ROLE_ADMIN">
      <div className="bg-background flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setMobileOpen(true)} />
          <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 p-5 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
