"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-card-border bg-card/80 p-0.5 text-xs font-semibold",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-md px-2 py-1 transition-colors",
          locale === "en"
            ? "bg-accent text-black"
            : "text-muted hover:text-foreground",
        )}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("fr")}
        className={cn(
          "rounded-md px-2 py-1 transition-colors",
          locale === "fr"
            ? "bg-accent text-black"
            : "text-muted hover:text-foreground",
        )}
        aria-pressed={locale === "fr"}
      >
        FR
      </button>
    </div>
  );
}
