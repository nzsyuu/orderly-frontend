import { ChefHat } from "lucide-react";
import { fieldClassName } from "@/shared/ui/modal";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="border-border bg-card w-full max-w-md rounded-2xl border p-6 sm:p-7">
      <div className="mb-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="bg-primary text-brand flex size-9 items-center justify-center rounded-xl">
            <ChefHat className="size-5" />
          </div>
          <span className="font-condensed text-foreground text-xl font-extrabold">
            Orderly
          </span>
        </div>
        <h1 className="font-condensed text-foreground text-2xl font-extrabold">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
      </div>
      {children}
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}

export const authFieldClassName = fieldClassName;
