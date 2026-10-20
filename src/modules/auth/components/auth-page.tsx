import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-5">
      <div className="mb-4 w-full max-w-md">
        <Link
          href="/cardapio"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Voltar ao cardápio
        </Link>
      </div>
      {children}
    </div>
  );
}
