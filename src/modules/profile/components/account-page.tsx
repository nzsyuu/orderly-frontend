"use client";

import { useState } from "react";
import { KeyRound, MapPin, ShieldAlert, UserRound } from "lucide-react";
import { AuthGate } from "@/modules/auth/components/auth-gate";
import { useSession } from "@/modules/auth/hooks/use-auth";
import { AddressesSection } from "@/modules/profile/components/addresses-section";
import { ChangePasswordForm } from "@/modules/profile/components/change-password-form";
import { DeleteAccountDialog } from "@/modules/profile/components/delete-account-dialog";
import { ProfileNameForm } from "@/modules/profile/components/profile-name-form";
import { CustomerHeader } from "@/modules/shell/components/customer-header";
import { UserAvatar } from "@/modules/shell/components/user-avatar";

function Section({
  icon: Icon,
  title,
  children,
  tone = "default",
}: {
  icon: typeof UserRound;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={`mb-4 rounded-lg border bg-card p-4 ${
        tone === "danger" ? "border-destructive/30" : "border-border"
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${tone === "danger" ? "text-destructive" : "text-primary"}`}
        />
        <h2 className="text-foreground text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function AccountPage() {
  return (
    <AuthGate>
      <Account />
    </AuthGate>
  );
}

function Account() {
  const session = useSession();
  const user = session.data;
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <CustomerHeader
        title="Minha conta"
        backHref="/cardapio"
        backLabel="Voltar ao cardápio"
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <UserAvatar name={user.name} size="lg" />
          <div className="min-w-0">
            <p className="font-display text-foreground truncate text-xl font-bold tracking-tight">
              {user.name}
            </p>
            <p className="text-muted-foreground truncate text-sm">
              {user.email}
            </p>
          </div>
        </div>

        <Section icon={UserRound} title="Dados pessoais">
          <ProfileNameForm user={user} />
        </Section>

        <Section icon={MapPin} title="Endereços">
          <AddressesSection />
        </Section>

        <Section icon={KeyRound} title="Segurança">
          <ChangePasswordForm />
        </Section>

        <Section icon={ShieldAlert} title="Excluir conta" tone="danger">
          <p className="text-muted-foreground mb-4 max-w-md text-sm">
            Ao excluir a conta, seus dados e endereços são removidos de forma
            permanente. Essa ação não pode ser desfeita.
          </p>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="bg-destructive hover:bg-destructive/90 focus-visible:ring-ring/50 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors outline-none focus-visible:ring-3"
          >
            Excluir minha conta
          </button>
        </Section>
      </main>

      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
