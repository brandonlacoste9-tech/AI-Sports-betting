"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StakeAffiliateCta } from "@/components/shared/affiliate-cta";
import { BANKROLL_BETS } from "@/lib/games/catalog";
import { formatAmericanOdds, unitsFromOdds } from "@/lib/utils";
import { bumpPlay } from "@/components/games/score-store";

const START = 1000;

function profitOnStake(american: number, stake: number, won: boolean): number {
  if (!won) return -stake;
  const units = unitsFromOdds(american, "WIN");
  return stake * units;
}

export function BankrollRunGame() {
  const deck = useMemo(
    () => [...BANKROLL_BETS].sort(() => Math.random() - 0.5),
    [],
  );
  const [i, setI] = useState(0);
  const [bank, setBank] = useState(START);
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const bet = deck[i];
  const bust = bank <= 0;

  function play(units: 0 | 1 | 2 | 5) {
    if (busy || done || bust || !bet) return;
    if (units === 0) {
      // skip
      advance(bank, `Skipped ${bet.label}`);
      return;
    }
    const stake = Math.min(bank, units * 50); // $50 unit
    if (stake <= 0) return;
    setBusy(true);
    const won = Math.random() < bet.winProb;
    const delta = profitOnStake(bet.odds, stake, won);
    const nextBank = Math.max(0, Math.round((bank + delta) * 100) / 100);
    const line = won
      ? `W ${bet.label} ${formatAmericanOdds(bet.odds)} · +$${delta.toFixed(0)}`
      : `L ${bet.label} ${formatAmericanOdds(bet.odds)} · -$${stake.toFixed(0)}`;
    advance(nextBank, line);
  }

  function advance(nextBank: number, line: string) {
    setBank(nextBank);
    setLog((prev) => [line, ...prev].slice(0, 8));
    const nextI = i + 1;
    if (nextBank <= 0 || nextI >= deck.length) {
      bumpPlay({ bankrollBest: Math.round(nextBank) });
      setDone(true);
      setBusy(false);
      return;
    }
    setI(nextI);
    setBusy(false);
  }

  if (done || bust) {
    const roi = ((bank - START) / START) * 100;
    return (
      <div className="bg-grid mx-auto max-w-lg space-y-6 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Bankroll Run over</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold">
              $<span className="text-accent">{bank.toFixed(0)}</span>
              <span className="ml-2 text-sm font-normal text-muted">
                ({roi >= 0 ? "+" : ""}
                {roi.toFixed(1)}% paper)
              </span>
            </p>
            <p className="text-sm text-muted">
              Paper money only. Real bankrolls need unit size discipline — try the
              calculator on your dashboard.
            </p>
            <ul className="space-y-1 text-xs text-muted">
              {log.map((l, idx) => (
                <li key={idx}>{l}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => window.location.reload()}>Run again</Button>
              <Link href="/games">
                <Button variant="secondary">All games</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <StakeAffiliateCta />
      </div>
    );
  }

  return (
    <div className="bg-grid mx-auto max-w-lg space-y-4 px-4 py-10">
      <div className="flex items-center justify-between">
        <Link href="/games" className="text-sm text-muted hover:text-foreground">
          ← Games
        </Link>
        <Badge variant="accent">${bank.toFixed(0)} bank</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between text-xs text-muted">
            <span>
              Bet {i + 1}/{deck.length}
            </span>
            <span>Unit = $50</span>
          </div>
          <CardTitle className="text-lg">{bet.label}</CardTitle>
          <p className="text-2xl font-bold tabular-nums text-accent">
            {formatAmericanOdds(bet.odds)}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted">
            Paper stake only. How many units?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {([0, 1, 2, 5] as const).map((u) => (
              <Button
                key={u}
                variant={u === 0 ? "outline" : "secondary"}
                disabled={busy}
                onClick={() => play(u)}
              >
                {u === 0 ? "Skip" : `${u}u`}
              </Button>
            ))}
          </div>
          {log[0] && (
            <p className="text-xs text-muted" role="status">
              Last: {log[0]}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
