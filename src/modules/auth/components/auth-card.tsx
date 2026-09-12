import { ChefHat } from "lucide-react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="border-border bg-card w-full max-w-md rounded-md border p-6 shadow-lg">
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-sm">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="font-display text-foreground text-lg font-bold tracking-tight">
            Orderly
          </span>
        </div>
        <h1 className="font-display text-foreground text-lg font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      </div>
      {children}
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}

export const authFieldClassName =
  "border-input bg-background focus:border-ring focus:ring-ring/30 h-10 rounded-lg border px-3 text-sm outline-none focus:ring-2";
