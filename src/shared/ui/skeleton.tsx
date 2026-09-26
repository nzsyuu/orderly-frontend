import { cn } from "@/shared/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted animate-pulse rounded-md",
        className,
      )}
    />
  );
}
