import type { Sport } from "@prisma/client";

/** Normalized event used by odds ingest + AI pick generation. */
export type OddsEvent = {
  id: string;
  sport: Sport;
  league: string;
  eventName: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmaker: string;
  markets: {
    key: "h2h" | "spreads" | "totals";
    outcomes: { name: string; price: number; point?: number }[];
  }[];
  context: {
    injuries?: string[];
    weather?: string;
    lineMove?: string;
    notes?: string[];
  };
};
