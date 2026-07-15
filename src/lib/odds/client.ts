import { getMockOddsEvents, type OddsEvent } from "@/lib/odds/mock-data";
import { fetchApiSportsSoccerEvents } from "@/lib/odds/api-sports";
import type { Sport } from "@prisma/client";

const SPORT_KEYS: Record<Sport, string> = {
  NFL: "americanfootball_nfl",
  NBA: "basketball_nba",
  MLB: "baseball_mlb",
  NHL: "icehockey_nhl",
  UFC: "mma_mixed_martial_arts",
  SOCCER: "soccer_epl",
};

const DEFAULT_SPORTS: Sport[] = ["NFL", "NBA", "MLB", "NHL", "UFC", "SOCCER"];

export type OddsSource = "mock" | "the-odds-api" | "api-sports" | "merged";

/**
 * Fetch odds from:
 * 1) The Odds API (multi-sport US books) when ODDS_API_KEY is set
 * 2) API-Sports football (global soccer) when API_SPORTS_KEY is set
 * Falls back to mock only if both empty / return nothing.
 */
export async function fetchOddsEvents(sports?: Sport[]): Promise<{
  events: OddsEvent[];
  source: OddsSource;
  sources: OddsSource[];
}> {
  const targetSports = sports ?? DEFAULT_SPORTS;
  const events: OddsEvent[] = [];
  const sources: OddsSource[] = [];

  const oddsKey = process.env.ODDS_API_KEY;
  if (oddsKey) {
    const fromOddsApi = await fetchFromTheOddsApi(targetSports, oddsKey);
    if (fromOddsApi.length) {
      events.push(...fromOddsApi);
      sources.push("the-odds-api");
    }
  }

  // API-Sports adds broader soccer coverage (free tier: 100 req/day)
  const wantsSoccer = targetSports.includes("SOCCER");
  if (wantsSoccer && process.env.API_SPORTS_KEY) {
    try {
      const soccer = await fetchApiSportsSoccerEvents({ maxFixtures: 5 });
      if (soccer.length) {
        // Prefer unique events; keep both if different leagues/ids
        const existingNames = new Set(
          events.filter((e) => e.sport === "SOCCER").map((e) => e.eventName.toLowerCase()),
        );
        for (const s of soccer) {
          if (!existingNames.has(s.eventName.toLowerCase())) {
            events.push(s);
          }
        }
        sources.push("api-sports");
      }
    } catch (err) {
      console.warn("[odds] api-sports error", err);
    }
  }

  if (events.length === 0) {
    return { events: getMockOddsEvents(), source: "mock", sources: ["mock"] };
  }

  const source: OddsSource =
    sources.length > 1 ? "merged" : sources[0] === "api-sports" ? "api-sports" : "the-odds-api";

  return { events, source, sources };
}

async function fetchFromTheOddsApi(
  targetSports: Sport[],
  apiKey: string,
): Promise<OddsEvent[]> {
  const events: OddsEvent[] = [];

  for (const sport of targetSports) {
    const key = SPORT_KEYS[sport];
    if (!key) continue;

    try {
      const url = new URL(`https://api.the-odds-api.com/v4/sports/${key}/odds`);
      url.searchParams.set("apiKey", apiKey);
      url.searchParams.set("regions", "us");
      url.searchParams.set(
        "markets",
        sport === "UFC" ? "h2h" : "h2h,spreads,totals",
      );
      url.searchParams.set("oddsFormat", "american");

      const res = await fetch(url.toString(), { next: { revalidate: 300 } });
      if (!res.ok) {
        console.warn(`[odds] ${sport} fetch failed:`, res.status);
        continue;
      }

      const data = (await res.json()) as Array<{
        id: string;
        sport_title: string;
        commence_time: string;
        home_team: string;
        away_team: string;
        bookmakers: Array<{
          key: string;
          markets: Array<{
            key: string;
            outcomes: Array<{ name: string; price: number; point?: number }>;
          }>;
        }>;
      }>;

      for (const game of data.slice(0, 4)) {
        const book = game.bookmakers[0];
        if (!book) continue;
        events.push({
          id: game.id,
          sport,
          league: game.sport_title,
          eventName: `${game.away_team} vs ${game.home_team}`,
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          commenceTime: game.commence_time,
          bookmaker: book.key,
          markets: book.markets
            .filter((m) => m.key === "h2h" || m.key === "spreads" || m.key === "totals")
            .map((m) => ({
              key: m.key as "h2h" | "spreads" | "totals",
              outcomes: m.outcomes,
            })),
          context: {},
        });
      }
    } catch (err) {
      console.warn(`[odds] ${sport} error`, err);
    }
  }

  return events;
}
