"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StakeAffiliateCta } from "@/components/shared/affiliate-cta";
import { ODDS_QUIZ } from "@/lib/games/catalog";
import { formatAmericanOdds } from "@/lib/utils";
import { bumpPlay } from "@/components/games/score-store";

export function OddsQuizGame() {
  const deck = useMemo(() => [...ODDS_QUIZ].sort(() => Math.random() - 0.5), []);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [explain, setExplain] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);

  const q = deck[i];

  function answer(favorite: boolean) {
    if (!q || locked || done) return;
    setLocked(true);
    const ok = favorite === q.isFavorite;
    const next = score + (ok ? 1 : 0);
    setScore(next);
    setExplain(
      (ok ? "Correct. " : "Not quite. ") + q.explain,
    );
    window.setTimeout(() => {
      if (i + 1 >= deck.length) {
        bumpPlay({ oddsQuizBest: next });
        setDone(true);
      } else {
        setI(i + 1);
        setExplain(null);
        setLocked(false);
      }
    }, 1400);
  }

  if (done) {
    return (
      <div className="bg-grid mx-auto max-w-lg space-y-6 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Odds IQ result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold text-accent">
              {score}/{deck.length}
            </p>
            <p className="text-sm text-muted">
              {score >= 7
                ? "Sharp eye — ready for real lines on the dashboard."
                : score >= 4
                  ? "Solid base. Keep drilling negative vs positive juice."
                  : "Keep going — favorites wear the minus sign."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  window.location.reload();
                }}
              >
                Retry
              </Button>
              <Link href="/games">
                <Button variant="secondary">All games</Button>
              </Link>
              <Link href="/odds">
                <Button variant="outline">Live odds board</Button>
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
        <Badge variant="muted">
          {i + 1}/{deck.length} · {score} pts
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Favorite or underdog?</CardTitle>
          <p className="text-sm text-muted">{q.prompt}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-accent/30 bg-accent/10 py-8 text-center">
            <div className="text-xs uppercase tracking-wide text-muted">American odds</div>
            <div className="mt-1 text-4xl font-bold tabular-nums text-accent">
              {formatAmericanOdds(q.odds)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button disabled={locked} onClick={() => answer(true)}>
              Favorite
            </Button>
            <Button disabled={locked} variant="secondary" onClick={() => answer(false)}>
              Underdog
            </Button>
          </div>
          {explain && (
            <p className="text-sm text-muted" role="status">
              {explain}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
