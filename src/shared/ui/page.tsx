import { cn } from "@/shared/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

/** Título da página do painel administrativo, com ações à direita. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-condensed text-foreground text-[2rem] leading-none font-extrabold sm:text-[2.5rem]">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-[0.9375rem]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

type PanelProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
  as?: "section" | "div";
};

/** Contêiner padrão das seções: borda fina, cantos de 14px, sem sombra. */
export function Panel({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
  as: Tag = "section",
}: PanelProps) {
  return (
    <Tag
      className={cn(
        "border-border bg-card min-w-0 rounded-2xl border",
        className,
      )}
    >
      {title || action ? (
        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-foreground text-base font-semibold">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-muted-foreground mt-0.5 text-sm">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-5 sm:p-6", title && "pt-4 sm:pt-4", bodyClassName)}>
        {children}
      </div>
    </Tag>
  );
}

type EmptyStateProps = {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="bg-muted text-muted-foreground mb-3 flex size-12 items-center justify-center rounded-full">
          <Icon className="size-5" />
        </span>
      ) : null}
      <p className="text-foreground font-semibold">{title}</p>
      {description ? (
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  count?: number;
};

type SegmentedProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label: string;
  className?: string;
};

/** Grupo de botões exclusivos (filtros, presets de período). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "bg-muted inline-flex max-w-full scrollbar-thin gap-0.5 overflow-x-auto rounded-xl p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-card text-foreground shadow-[0_1px_2px_rgb(15_26_19/0.12)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
            {option.count !== undefined ? (
              <span
                className={cn(
                  "tabular text-xs",
                  active ? "text-muted-foreground" : "text-muted-foreground/80",
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
