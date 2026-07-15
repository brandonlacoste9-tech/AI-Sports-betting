"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmericanOdds } from "@/lib/utils";
import { Lock, Sparkles } from "lucide-react";

export type PickCardData = {
  id: string;
  sport: string;
  league: string | null;
  eventName: string;
  market: string;
  pickSide: string;
  oddsAmerican: number;
  confidence: number;
  edgePercent: number;
  unitsSuggested: number;
  reasoning: string | null;
  keyFactors: string[];
  result: string;
  isPremium: boolean;
  locked?: boolean;
  date?: string | Date;
};

export function PicksList({
  title,
  picks,
  emptyMessage = "No picks yet. Check back soon.",
}: {
  title: string;
  picks: PickCardData[];
  emptyMessage?: string;
}) {
  const [items, setItems] = useState(picks);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function unlock(pickId: string) {
    setLoadingId(pickId);
    try {
      const res = await fetch("/api/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickId }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        alert(data.error ?? "Could not unlock pick");
        return;
      }
      // Refresh list
      const list = await fetch("/api/picks");
      if (list.ok) {
        const data = (await list.json()) as { today: PickCardData[]; history: PickCardData[] };
        // Prefer today's refresh if this list looks like today
        setItems(title.toLowerCase().includes("today") ? data.today : data.history);
      }
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <Badge variant="muted">{items.length}</Badge>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.length === 0 && <p className="text-sm text-muted">{emptyMessage}</p>}
        {items.map((pick) => (
          <article
            key={pick.id}
            className="rounded-xl border border-card-border bg-background/50 p-4 transition hover:border-accent/30"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{pick.sport}</Badge>
                <Badge variant="muted">{pick.market}</Badge>
                {pick.isPremium && (
                  <Badge variant="warning">
                    <Sparkles className="mr-1 h-3 w-3" /> Pro
                  </Badge>
                )}
                {pick.result !== "PENDING" && (
                  <Badge
                    variant={
                      pick.result === "WIN"
                        ? "accent"
                        : pick.result === "LOSS"
                          ? "danger"
                          : "muted"
                    }
                  >
                    {pick.result}
                  </Badge>
                )}
              </div>
              {!pick.locked && (
                <div className="text-right text-sm">
                  <div className="font-mono text-accent">
                    {formatAmericanOdds(pick.oddsAmerican)}
                  </div>
                  <div className="text-xs text-muted">{pick.unitsSuggested}u</div>
                </div>
              )}
            </div>

            <h4 className="mt-2 font-semibold">{pick.eventName}</h4>

            {pick.locked ? (
              <div className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed border-card-border bg-card/40 p-3">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Lock className="h-4 w-4" />
                  {pick.reasoning ?? "Locked pick"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={loadingId === pick.id}
                    onClick={() => unlock(pick.id)}
                  >
                    {loadingId === pick.id ? "Unlocking…" : "Use free unlock"}
                  </Button>
                  <a href="/settings">
                    <Button size="sm">Upgrade</Button>
                  </a>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-1 text-accent">
                  <span className="font-semibold">{pick.pickSide}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                  <span>
                    Confidence{" "}
                    <strong className="text-foreground">{pick.confidence.toFixed(0)}%</strong>
                  </span>
                  <span>
                    Edge{" "}
                    <strong className="text-accent">+{pick.edgePercent.toFixed(1)}%</strong>
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{pick.reasoning}</p>
                {pick.keyFactors?.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {pick.keyFactors.map((f) => (
                      <li key={f}>
                        <Badge variant="muted">{f}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
