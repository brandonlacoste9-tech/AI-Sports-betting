"use client";

const KEY = "betedge_game_scores_v1";

export type GameScores = {
  pickemBest: number;
  pickemStreak: number;
  oddsQuizBest: number;
  bankrollBest: number;
  plays: number;
};

const DEFAULTS: GameScores = {
  pickemBest: 0,
  pickemStreak: 0,
  oddsQuizBest: 0,
  bankrollBest: 0,
  plays: 0,
};

export function loadScores(): GameScores {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<GameScores>) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveScores(next: GameScores): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function bumpPlay(partial: Partial<GameScores>): GameScores {
  const cur = loadScores();
  const next: GameScores = {
    ...cur,
    plays: cur.plays + 1,
    pickemBest:
      partial.pickemBest != null
        ? Math.max(cur.pickemBest, partial.pickemBest)
        : cur.pickemBest,
    pickemStreak:
      partial.pickemStreak != null
        ? Math.max(cur.pickemStreak, partial.pickemStreak)
        : cur.pickemStreak,
    oddsQuizBest:
      partial.oddsQuizBest != null
        ? Math.max(cur.oddsQuizBest, partial.oddsQuizBest)
        : cur.oddsQuizBest,
    bankrollBest:
      partial.bankrollBest != null
        ? Math.max(cur.bankrollBest, partial.bankrollBest)
        : cur.bankrollBest,
  };
  saveScores(next);
  return next;
}
