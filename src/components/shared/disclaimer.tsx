"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";

export function Disclaimer({ className }: { className?: string }) {
  const t = useT();
  return (
    <p className={cn("text-xs leading-relaxed text-muted", className)}>{t.disclaimer}</p>
  );
}
