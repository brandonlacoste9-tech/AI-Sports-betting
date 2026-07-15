import { getMockOddsEvents, type OddsEvent } from "@/lib/odds/mock-data";
import type { Sport } from "@prisma/client";

const SPORT_KEYS: Partial<Record<Sport, string>> = {
  NFL: "americanfootball_nfl",
  NBA: "basketball_nba",
  MLB: "baseball_mlb",
  NHL: "icehockey_nhl",
  SOCCER: "soccer_epl",
  // UFC often unavailable on free Odds API keys — mock used
};

/**
 * Fetch odds from The Odds API when ODDS_API_KEY is set; otherwise mock slate.
 */
export async function fetchOddsEvents(sports?: Sport[]): Promise<{
  events: OddsEvent[];
  source: "mock" | "the-odds-api";
}> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return { events: getMockOddsEvents(), source: "mock" };
  }

  const targetSports = sports ?? (["NFL", "NBA", "MLB", "NHL", "SOCCER"] as Sport[]);
  const events: OddsEvent[] = [];

  for (const sport of targetSports) {
    const key = SPORT_KEYS[sport];
    if (!key) continue;

    try {
      const url = new URL(`https://api.the-odds-api.com/v4/sports/${key}/odds`);
      url.searchParams.set("apiKey", apiKey);
      url.searchParams.set("regions", "us");
      url.searchParams.set("markets", "h2h,spreads,totals");
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

      for (const game of data.slice(0, 5)) {
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

  // Always include UFC mock + fill if API returned nothing
  const mock = getMockOddsEvents();
  if (events.length === 0) {
    return { events: mock, source: "mock" };
  }

  const ufc = mock.filter((e) => e.sport === "UFC");
  return { events: [...events, ...ufc], source: "the-odds-api" };
}
