import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLineMoves } from "@/lib/odds/ingest";
import { PLAN_LIMITS } from "@/lib/subscriptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/shared/disclaimer";
import { formatAmericanOdds } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Line moves",
  description: "Steam and line movement tracker for BetEdge Pro/Basic members.",
};

export const dynamic = "force-dynamic";

export default async function LineMovesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/line-moves");
  }

  const allowed = PLAN_LIMITS[session.user.plan].lineMoves;

  if (!allowed) {
    return (
      <div className="bg-grid mx-auto max-w-3xl space-y-6 px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Line moves</h1>
        <p className="text-muted">
          Track steam and price changes across our odds layer. Available on{" "}
          <strong className="text-foreground">Basic</strong> and{" "}
          <strong className="text-foreground">Pro</strong>.
        </p>
        <Link href="/settings">
          <Button size="lg">Upgrade plan</Button>
        </Link>
        <Disclaimer className="mx-auto max-w-lg text-center" />
      </div>
    );
  }

  const moves = await getLineMoves({ limit: 50, hours: 72 });

  return (
    <div className="bg-grid mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Line moves</h1>
          <p className="mt-1 text-muted">
            Largest American-odds swings from stored snapshots (last 72h)
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/odds">
            <Button variant="secondary" size="sm">
              Public board
            </Button>
          </Link>
          <Badge variant="accent">{session.user.plan}</Badge>
        </div>
      </div>

      <Disclaimer />

      <Card>
        <CardHeader>
          <CardTitle>Steam board</CardTitle>
          <CardDescription>
            {moves.length === 0
              ? "No moves yet — run odds ingest twice (admin or cron) to create history."
              : `${moves.length} moves ranked by |Δ odds|`}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {moves.length > 0 && (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-card-border">
                  <th className="pb-2 pr-2 font-medium">Sport</th>
                  <th className="pb-2 pr-2 font-medium">Event</th>
                  <th className="pb-2 pr-2 font-medium">Market</th>
                  <th className="pb-2 pr-2 font-medium">Selection</th>
                  <th className="pb-2 pr-2 font-medium">From</th>
                  <th className="pb-2 pr-2 font-medium">To</th>
                  <th className="pb-2 pr-2 font-medium">Δ</th>
                  <th className="pb-2 font-medium">Book</th>
                </tr>
              </thead>
              <tbody>
                {moves.map((m, i) => (
                  <tr key={`${m.eventId}-${m.selection}-${i}`} className="border-b border-card-border/50">
                    <td className="py-2 pr-2">
                      <Badge variant="muted">{m.sport}</Badge>
                    </td>
                    <td className="py-2 pr-2 font-medium">{m.eventName}</td>
                    <td className="py-2 pr-2 text-muted">{m.marketKey}</td>
                    <td className="py-2 pr-2">
                      {m.selection}
                      {m.currentPoint != null ? ` ${m.currentPoint}` : ""}
                    </td>
                    <td className="py-2 pr-2 font-mono">{formatAmericanOdds(m.previousOdds)}</td>
                    <td className="py-2 pr-2 font-mono text-accent">
                      {formatAmericanOdds(m.currentOdds)}
                    </td>
                    <td
                      className={`py-2 pr-2 font-mono ${m.delta > 0 ? "text-accent" : "text-danger"}`}
                    >
                      {m.delta > 0 ? "+" : ""}
                      {m.delta}
                    </td>
                    <td className="py-2 text-muted">{m.bookmaker}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
