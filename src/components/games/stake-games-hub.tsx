"use client";

import { ExternalLink, Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AFFILIATES } from "@/lib/affiliates";

/**
 * Stake casino lobby only — no on-site free games, no game tiles.
 * All real play opens on Stake via affiliate links.
 */
export function StakeGamesHub({
  sportsHref,
  slotsHref,
  casinoHref,
}: {
  sportsHref: string;
  slotsHref: string;
  casinoHref: string;
}) {
  const stake = AFFILIATES.stake;

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
        <span>15 slot-style · 6 table · 6 instant</span>
        <span>·</span>
        <span>Static catalog</span>
        <span>·</span>
        <span>18+/21+ · Gamble responsibly</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm">Slots (15)</Button>
        <Button size="sm" variant="secondary">
          Table (6)
        </Button>
        <Button size="sm" variant="secondary">
          Instant (6)
        </Button>
        <Button size="sm" variant="secondary">
          All (27)
        </Button>
      </div>

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
          <a href={slotsHref} target="_blank" rel={stake.rel} className="shrink-0">
            <Button className="gap-1.5">
              Browse all slots
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted">
        Games are provided by Stake.com. BetEdge is an affiliate partner and may
        earn a commission. You must be of legal age where you play. Play
        responsibly.
      </p>
    </div>
  );
}
