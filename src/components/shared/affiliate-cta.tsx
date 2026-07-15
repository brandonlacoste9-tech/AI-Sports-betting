"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AFFILIATES } from "@/lib/affiliates";
import { useT } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

type Variant = "banner" | "inline" | "compact";

export function StakeAffiliateCta({
  variant = "banner",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const t = useT();
  const partner = AFFILIATES.stake;

  if (variant === "inline") {
    return (
      <a
        href={partner.url}
        target="_blank"
        rel={partner.rel}
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline",
          className,
        )}
      >
        {t.affiliate.stakeCta}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <a href={partner.url} target="_blank" rel={partner.rel} className={className}>
        <Button size="sm" variant="secondary" className="gap-1.5">
          {t.affiliate.stakeCta}
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </a>
    );
  }

  return (
    <Card className={cn("border-accent/25 bg-accent/5", className)}>
      <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">
            {t.affiliate.partnerLabel}
          </div>
          <p className="mt-1 text-sm text-muted">{t.affiliate.stakeBody}</p>
          <p className="mt-1 text-[11px] text-muted/70">{t.affiliate.disclosure}</p>
        </div>
        <a href={partner.url} target="_blank" rel={partner.rel} className="shrink-0">
          <Button className="gap-1.5 glow-accent">
            {t.affiliate.stakeCta}
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
