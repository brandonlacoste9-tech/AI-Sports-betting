"use client";

import Image from "next/image";
import { ExternalLink, Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AFFILIATES } from "@/lib/affiliates";
import type { StakeGameCard } from "@/lib/games/stake-games";

export function StakeGamesHub({
  games,
  sportsHref,
  source,
}: {
  games: StakeGameCard[];
  sportsHref: string;
  source: string;
}) {
  const stake = AFFILIATES.stake;

  return (
    <div className="bg-grid mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="accent" className="mb-2 gap-1">
            <Gamepad2 className="h-3 w-3" /> Stake only
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Games on <span className="text-accent">Stake</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Official Stake Originals. Tap a game to open it on Stake with our
            partner link — play happens on Stake, not on BetEdge.
          </p>
        </div>
        <a href={sportsHref} target="_blank" rel={stake.rel}>
          <Button variant="secondary" className="gap-1.5">
            Stake Sportsbook
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Badge variant="muted">Partner: Stake</Badge>
        <span>Catalog: {source === "stake-api" ? "live from Stake" : "static"}</span>
        <span>·</span>
        <span>18+/21+ · Terms apply · Gamble responsibly</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <Card
            key={g.id}
            className="overflow-hidden border-card-border transition hover:border-accent/40"
          >
            <div className="relative aspect-[16/10] bg-card">
              {g.thumbnailUrl ? (
                <Image
                  src={g.thumbnailUrl}
                  alt={g.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-bold text-accent">
                  {g.name}
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{g.name}</CardTitle>
                <Badge variant="muted">Original</Badge>
              </div>
              <CardDescription>{g.blurb}</CardDescription>
              {g.edge != null && (
                <p className="text-xs text-muted">
                  House edge ~{(g.edge * 100).toFixed(1)}%
                </p>
              )}
            </CardHeader>
            <CardContent>
              <a href={g.href} target="_blank" rel={stake.rel} className="block">
                <Button className="w-full gap-1.5">
                  Play on Stake
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-accent">
              Full casino
            </div>
            <p className="mt-1 text-sm text-muted">
              Thousands more slots & live tables on Stake. Same affiliate code.
            </p>
          </div>
          <a href={stake.url} target="_blank" rel={stake.rel}>
            <Button variant="secondary" className="gap-1.5">
              Open Stake
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted">
        BetEdge is not a sportsbook or casino. Games open on Stake.com (third
        party). Affiliate disclosure: we may earn a commission. Play responsibly.
      </p>
    </div>
  );
}
