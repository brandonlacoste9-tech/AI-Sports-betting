"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StakeAffiliateCta } from "@/components/shared/affiliate-cta";
import type { PickemMatch } from "@/lib/games/catalog";
import { bumpPlay } from "@/components/games/score-store";

type Phase = "loading" | "play" | "done";

/** Free-play winner: deterministic from seed so same slate is consistent per day-ish. */
function simulatedWinner(m: PickemMatch): "home" | "away" {
  return m.seed % 2 === 0 ? "home" : "away";
}

export function PickemGame() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [matches, setMatches] = useState<PickemMatch[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [source, setSource] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/games/pickem");
        const data = (await res.json()) as {
          matches: PickemMatch[];
          source?: string;
        };
        if (cancelled) return;
        setMatches(data.matches ?? []);
        setSource(data.source ?? "");
        setPhase("play");
      } catch {
        if (!cancelled) setPhase("play");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = matches[index];

  const pick = useCallback(
    (side: "home" | "away") => {
      if (!current || locked || phase !== "play") return;
      setLocked(true);
      const winner = simulatedWinner(current);
      const correct = side === winner;
      const nextScore = score + (correct ? 1 : 0);
      const nextStreak = correct ? streak + 1 : 0;
      setScore(nextScore);
      setStreak(nextStreak);
      setFeedback(
        correct
          ? `Nice — ${side === "home" ? current.home : current.away} covers the sim.`
          : `Miss — sim result: ${winner === "home" ? current.home : current.away}.`,
      );

      window.setTimeout(() => {
        const next = index + 1;
        if (next >= matches.length) {
          bumpPlay({ pickemBest: nextScore, pickemStreak: nextStreak });
          setPhase("done");
        } else {
          setIndex(next);
          setFeedback(null);
          setLocked(false);
        }
      }, 900);
    },
    [current, locked, phase, score, streak, index, matches.length],
  );

  function restart() {
    setIndex(0);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setLocked(false);
    setPhase("play");
  }

  if (phase === "loading") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted">
        Loading today&apos;s board…
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="bg-grid mx-auto max-w-lg space-y-6 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Pick&apos;em complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold text-accent">
              {score}/{matches.length}
            </p>
            <p className="text-sm text-muted">
              Best run streak this session: {streak}. Free play — not real betting results.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={restart}>Play again</Button>
              <Link href="/games">
                <Button variant="secondary">All games</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Real AI picks</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <StakeAffiliateCta />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted">No matchups available.</p>
        <Link href="/games" className="mt-4 inline-block text-accent">
          Back to games
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-grid mx-auto max-w-lg space-y-4 px-4 py-10">
      <div className="flex items-center justify-between">
        <Link href="/games" className="text-sm text-muted hover:text-foreground">
          ← Games
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="accent">
            {score} correct
          </Badge>
          <Badge variant="muted">
            {index + 1}/{matches.length}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="muted">{current.sport}</Badge>
            <Badge variant="muted">{current.league}</Badge>
            {source === "live" ? (
              <Badge variant="accent">Live board</Badge>
            ) : (
              <Badge variant="warning">Practice board</Badge>
            )}
          </div>
          <CardTitle className="text-xl leading-snug">
            Who wins?
          </CardTitle>
          <p className="text-sm text-muted">
            Free sim result (not a real-money market). Pick a side.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="h-auto w-full justify-start py-4 text-left"
            variant="secondary"
            disabled={locked}
            onClick={() => pick("away")}
          >
            <span className="text-xs text-muted">Away</span>
            <span className="mt-0.5 block text-base font-bold">{current.away}</span>
          </Button>
          <Button
            className="h-auto w-full justify-start py-4 text-left"
            variant="secondary"
            disabled={locked}
            onClick={() => pick("home")}
          >
            <span className="text-xs text-muted">Home</span>
            <span className="mt-0.5 block text-base font-bold">{current.home}</span>
          </Button>
          {feedback && (
            <p className="text-sm text-accent" role="status">
              {feedback}
            </p>
          )}
          {streak > 1 && (
            <p className="text-xs text-muted">🔥 Streak ×{streak}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
