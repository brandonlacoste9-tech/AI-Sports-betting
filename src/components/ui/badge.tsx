import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "accent" | "muted" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        variant === "default" && "bg-card-border/60 text-foreground",
        variant === "accent" && "bg-accent/15 text-accent",
        variant === "muted" && "bg-white/5 text-muted",
        variant === "warning" && "bg-warning/15 text-warning",
        variant === "danger" && "bg-danger/15 text-danger",
        className,
      )}
      {...props}
    />
  );
}
