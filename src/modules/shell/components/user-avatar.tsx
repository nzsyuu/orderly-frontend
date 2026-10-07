type UserAvatarProps = {
  name: string;
  size?: "sm" | "lg";
  className?: string;
};

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function UserAvatar({ name, size = "sm", className = "" }: UserAvatarProps) {
  const sizeClassName =
    size === "lg" ? "h-16 w-16 text-xl" : "h-9 w-9 text-xs";

  return (
    <span
      aria-hidden
      className={`bg-primary text-primary-foreground font-display inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide ${sizeClassName} ${className}`}
    >
      {getInitials(name)}
    </span>
  );
}
