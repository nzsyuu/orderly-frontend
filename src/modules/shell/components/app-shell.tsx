import { AuthGate } from "@/modules/auth/components/auth-gate";
import { Sidebar } from "@/modules/shell/components/sidebar";
import { Topbar } from "@/modules/shell/components/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="bg-background flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 space-y-6 p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthGate>
  );
}
