"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Gamepad2, Trophy, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StakeAffiliateCta } from "@/components/shared/affiliate-cta";
import { GAMES } from "@/lib/games/catalog";
import { loadScores, type GameScores } from "@/components/games/score-store";

export function GamesHub() {
  const [scores, setScores] = useState<GameScores | null>(null);

  useEffect(() => {
    setScores(loadScores());
  }, []);

  return (
    <div className="bg-grid mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="accent" className="mb-2 gap-1">
            <Gamepad2 className="h-3 w-3" /> Free play
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Games on <span className="text-accent">Edge</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Quick skill games to stay sharp between slates. No real-money wagering on
            BetEdge — just practice, streaks, and bragging rights. When you want
            action, Stake is one click away.
          </p>
        </div>
        {scores && (
          <Card className="min-w-[200px]">
            <CardContent className="flex items-center gap-3 p-4">
              <Trophy className="h-8 w-8 text-accent" />
              <div>
                <div className="text-xs text-muted">Your stats (this device)</div>
                <div className="text-lg font-bold">{scores.plays} plays</div>
                <div className="text-xs text-muted">
                  Best streak {scores.pickemStreak} · Quiz {scores.oddsQuizBest}/8
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {GAMES.map((g) => (
          <Card
            key={g.id}
            className="flex flex-col border-card-border transition hover:border-accent/40"
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="muted">{g.badge}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Timer className="h-3 w-3" /> {g.eta}
                </span>
              </div>
              <CardTitle className="text-xl">{g.title}</CardTitle>
              <CardDescription>{g.blurb}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link href={g.href}>
                <Button className="w-full">Play</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <StakeAffiliateCta />

      <p className="text-center text-xs text-muted">
        Free entertainment only. Games do not involve real-money wagering on BetEdge.
        18+/21+ where required. Gamble responsibly if you play on third-party sites.
      </p>
    </div>
  );
}
