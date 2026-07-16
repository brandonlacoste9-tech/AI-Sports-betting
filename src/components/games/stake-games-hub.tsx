"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ExternalLink, Gamepad2, Dices, Spade, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AFFILIATES } from "@/lib/affiliates";
import type { StakeGameCard, StakeGameCategory } from "@/lib/games/stake-games";

type Tab = "slots" | "table" | "instant" | "all";

export function StakeGamesHub({
  slots,
  table,
  instant,
  sportsHref,
  slotsHref,
  casinoHref,
  source,
}: {
  slots: StakeGameCard[];
  table: StakeGameCard[];
  instant: StakeGameCard[];
  sportsHref: string;
  slotsHref: string;
  casinoHref: string;
  source: string;
}) {
  const stake = AFFILIATES.stake;
  const [tab, setTab] = useState<Tab>("slots");

  const list = useMemo(() => {
    if (tab === "slots") return slots;
    if (tab === "table") return table;
    if (tab === "instant") return instant;
    return [...slots, ...table, ...instant];
  }, [tab, slots, table, instant]);

  return (
    <div className="bg-grid mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="accent" className="mb-2 gap-1">
            <Gamepad2 className="h-3 w-3" /> Stake casino
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Slots &amp; casino on <span className="text-accent">Stake</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Slot-style Originals, table games, and instant wins. Tap play to open
            the real game on Stake with our partner link — real money, real
            reels, your jurisdiction.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={slotsHref} target="_blank" rel={stake.rel}>
            <Button className="gap-1.5">
              Full slots lobby
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <a href={casinoHref} target="_blank" rel={stake.rel}>
            <Button variant="secondary" className="gap-1.5">
              Casino home
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <a href={sportsHref} target="_blank" rel={stake.rel}>
            <Button variant="outline" className="gap-1.5">
              Sportsbook
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Badge variant="muted">Partner: Stake</Badge>
        <span>
          {slots.length} slot-style · {table.length} table · {instant.length}{" "}
          instant
        </span>
        <span>·</span>
        <span>
          {source === "stake-api" ? "Live from Stake" : "Static catalog"}
        </span>
        <span>·</span>
        <span>18+/21+ · Gamble responsibly</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["slots", "Slots", slots.length, Dices],
            ["table", "Table", table.length, Spade],
            ["instant", "Instant", instant.length, Zap],
            [
              "all",
              "All",
              slots.length + table.length + instant.length,
              Gamepad2,
            ],
          ] as const
        ).map(([id, label, count, Icon]) => (
          <Button
            key={id}
            size="sm"
            variant={tab === id ? "default" : "secondary"}
            className="gap-1.5"
            onClick={() => setTab(id)}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className="opacity-70">({count})</span>
          </Button>
        ))}
      </div>

      {tab === "slots" && (
        <Card className="border-accent/25 bg-accent/5">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold text-accent">
                Thousands of provider slots
              </div>
              <p className="text-sm text-muted">
                Want Pragmatic, Hacksaw, and more? Open Stake&apos;s full slots
                lobby — same affiliate code.
              </p>
            </div>
            <a
              href={slotsHref}
              target="_blank"
              rel={stake.rel}
              className="shrink-0"
            >
              <Button className="gap-1.5">
                Browse all slots
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((g) => (
          <GameCard key={g.id} game={g} rel={stake.rel} />
        ))}
      </div>

      <p className="text-center text-xs text-muted">
        Games are provided by Stake.com. BetEdge is an affiliate partner and may
        earn a commission. You must be of legal age where you play. Play
        responsibly.
      </p>
    </div>
  );
}

function GameCard({ game, rel }: { game: StakeGameCard; rel: string }) {
  return (
    <Card className="overflow-hidden border-card-border transition hover:border-accent/40">
      <div className="relative aspect-[16/10] bg-card">
        {game.thumbnailUrl ? (
          <Image
            src={game.thumbnailUrl}
            alt={game.name}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-bold text-accent">
            {game.name}
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">{game.name}</CardTitle>
          <CategoryBadge category={game.category} />
        </div>
        <CardDescription>{game.blurb}</CardDescription>
        {game.edge != null && (
          <p className="text-xs text-muted">
            House edge ~{(game.edge * 100).toFixed(1)}%
          </p>
        )}
      </CardHeader>
      <CardContent>
        <a href={game.href} target="_blank" rel={rel} className="block">
          <Button className="w-full gap-1.5">
            Play on Stake
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

function CategoryBadge({ category }: { category: StakeGameCategory }) {
  if (category === "slots") return <Badge variant="accent">Slots</Badge>;
  if (category === "table") return <Badge variant="muted">Table</Badge>;
  return <Badge variant="warning">Instant</Badge>;
}
