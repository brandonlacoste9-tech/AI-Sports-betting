import type { Metadata } from "next";
import Link from "next/link";
import { getLatestBoard } from "@/lib/odds/ingest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/shared/disclaimer";
import { formatAmericanOdds } from "@/lib/utils";
import type { Sport } from "@prisma/client";

export const metadata: Metadata = {
  title: "Live odds board",
  description:
    "BetEdge Odds — free public sports odds board powered by our data layer. NFL, NBA, MLB, NHL, UFC, Soccer.",
};

export const dynamic = "force-dynamic";

const SPORTS: Array<Sport | "ALL"> = ["ALL", "NFL", "NBA", "MLB", "NHL", "UFC", "SOCCER"];

export default async function PublicOddsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const params = await searchParams;
  const sportParam = (params.sport?.toUpperCase() ?? "ALL") as Sport | "ALL";
  const sport = sportParam !== "ALL" && SPORTS.includes(sportParam) ? (sportParam as Sport) : undefined;

  const board = await getLatestBoard({ sport, limit: 48 });

  return (
    <div className="bg-grid mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge variant="accent" className="mb-2">
            BetEdge Odds
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Public odds board</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Free snapshot of markets we store in our odds layer. For live line steam and history,
            upgrade to Basic/Pro or use the developer API.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/docs/api">
            <Button variant="secondary">API docs</Button>
          </Link>
          <Link href="/line-moves">
            <Button>Line moves</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SPORTS.map((s) => {
          const href = s === "ALL" ? "/odds" : `/odds?sport=${s}`;
          const active = (s === "ALL" && !sport) || s === sport;
          return (
            <Link key={s} href={href}>
              <Badge variant={active ? "accent" : "muted"} className="cursor-pointer px-3 py-1">
                {s}
              </Badge>
            </Link>
          );
        })}
      </div>

      <Disclaimer />

      {board.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted">
            No odds snapshots yet. An admin/cron ingest will populate this board.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {board.map((event) => (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{event.sport}</Badge>
                  {event.league && <Badge variant="muted">{event.league}</Badge>}
                  {event.commenceTime && (
                    <span className="text-xs text-muted">
                      {new Date(event.commenceTime).toLocaleString()}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">{event.eventName}</CardTitle>
                <CardDescription>
                  {event.awayTeam} @ {event.homeTeam}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.markets.length === 0 ? (
                  <p className="text-sm text-muted">No markets stored</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="text-xs text-muted">
                        <tr className="border-b border-card-border">
                          <th className="pb-2 pr-3 font-medium">Market</th>
                          <th className="pb-2 pr-3 font-medium">Selection</th>
                          <th className="pb-2 pr-3 font-medium">Line</th>
                          <th className="pb-2 pr-3 font-medium">Odds</th>
                          <th className="pb-2 font-medium">Book</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.markets.map((m) => (
                          <tr key={m.id} className="border-b border-card-border/50">
                            <td className="py-1.5 pr-3">{m.marketKey}</td>
                            <td className="py-1.5 pr-3">{m.selection}</td>
                            <td className="py-1.5 pr-3 text-muted">
                              {m.point === null || m.point === undefined ? "—" : m.point}
                            </td>
                            <td className="py-1.5 pr-3 font-mono text-accent">
                              {formatAmericanOdds(m.oddsAmerican)}
                            </td>
                            <td className="py-1.5 text-muted">{m.bookmaker}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
