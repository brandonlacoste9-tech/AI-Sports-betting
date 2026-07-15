import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceCard } from "@/components/dashboard/performance-card";
import { StakeAffiliateCta } from "@/components/shared/affiliate-cta";
import { formatAmericanOdds } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Public record",
  description:
    "Transparent graded pick history for BetEdge AI — wins, losses, units, and ROI.",
  openGraph: {
    title: "BetEdge AI — Public record",
    description: "Verified graded picks and long-term performance.",
  },
};

export const dynamic = "force-dynamic";

export default async function RecordPage() {
  const [snapshot, graded] = await Promise.all([
    prisma.performanceSnapshot.findUnique({
      where: { period_sportKey: { period: "all_time", sportKey: "ALL" } },
    }),
    prisma.pick.findMany({
      where: { result: { in: ["WIN", "LOSS", "PUSH", "VOID"] } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 100,
      select: {
        id: true,
        date: true,
        sport: true,
        eventName: true,
        pickSide: true,
        oddsAmerican: true,
        result: true,
        profitUnits: true,
        confidence: true,
        isPremium: true,
      },
    }),
  ]);

  const wins = snapshot?.wins ?? graded.filter((g) => g.result === "WIN").length;
  const losses =
    snapshot?.losses ?? graded.filter((g) => g.result === "LOSS").length;
  const pushes =
    snapshot?.pushes ?? graded.filter((g) => g.result === "PUSH").length;
  const winRate = snapshot?.winRate ?? 0;
  const unitsProfit = snapshot?.unitsProfit ?? 0;
  const roiPercent = snapshot?.roiPercent ?? 0;
  const totalPicks = snapshot?.totalPicks ?? graded.length;

  return (
    <div className="bg-grid mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="accent" className="mb-2">
            Transparent
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Public record
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Graded picks only — no pending lines, no cherry-picking. Full ROI
            for everyone (marketing claims stay honest).
          </p>
        </div>
        <Link href="/register">
          <Button size="lg">Start free</Button>
        </Link>
      </div>

      <PerformanceCard
        wins={wins}
        losses={losses}
        pushes={pushes}
        winRate={winRate}
        unitsProfit={unitsProfit}
        roiPercent={roiPercent}
        totalPicks={totalPicks}
        title="All-time performance"
        description="Recalculated whenever an admin grades a pick."
      />

      <StakeAffiliateCta />

      <Card>
        <CardHeader>
          <CardTitle>Graded picks</CardTitle>
          <CardDescription>
            Latest {graded.length} settled results
            {totalPicks > graded.length ? ` (of ${totalPicks} all-time)` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {graded.length === 0 ? (
            <p className="text-sm text-muted">
              No graded picks yet. Once games settle and we mark WIN/LOSS/PUSH,
              they appear here automatically.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-muted">
                  <tr className="border-b border-card-border">
                    <th className="pb-2 pr-3 font-medium">Date</th>
                    <th className="pb-2 pr-3 font-medium">Sport</th>
                    <th className="pb-2 pr-3 font-medium">Event / pick</th>
                    <th className="pb-2 pr-3 font-medium">Odds</th>
                    <th className="pb-2 pr-3 font-medium">Result</th>
                    <th className="pb-2 font-medium text-right">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {graded.map((p) => (
                    <tr key={p.id} className="border-b border-card-border/60">
                      <td className="py-2.5 pr-3 text-muted whitespace-nowrap">
                        {p.date.toISOString().slice(0, 10)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge variant="muted">{p.sport}</Badge>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="font-medium">{p.eventName}</div>
                        <div className="text-accent">
                          {p.pickSide}
                          {p.isPremium ? (
                            <span className="ml-2 text-xs text-muted">PRO</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">
                        {formatAmericanOdds(p.oddsAmerican)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <ResultBadge result={p.result} />
                      </td>
                      <td
                        className={`py-2.5 text-right tabular-nums font-medium ${
                          (p.profitUnits ?? 0) > 0
                            ? "text-accent"
                            : (p.profitUnits ?? 0) < 0
                              ? "text-danger"
                              : "text-muted"
                        }`}
                      >
                        {p.profitUnits == null
                          ? "—"
                          : `${p.profitUnits >= 0 ? "+" : ""}${p.profitUnits.toFixed(2)}u`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted">
        Educational / entertainment only. Past performance does not guarantee
        future results. Not a sportsbook.
      </p>
    </div>
  );
}

function ResultBadge({ result }: { result: string }) {
  if (result === "WIN") return <Badge variant="accent">WIN</Badge>;
  if (result === "LOSS") return <Badge variant="danger">LOSS</Badge>;
  if (result === "PUSH") return <Badge variant="warning">PUSH</Badge>;
  return <Badge variant="muted">{result}</Badge>;
}
