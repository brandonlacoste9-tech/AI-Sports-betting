import type { OddsEvent } from "@/lib/odds/mock-data";

/**
 * API-Sports (api-football) free-tier client.
 * Header: x-apisports-key
 * Docs: https://www.api-football.com/documentation-v3
 *
 * Free plan: ~100 requests/day for football. Great soccer coverage;
 * other sports may be season-limited on free.
 */

type ApiSportsFixture = {
  fixture: { id: number; date: string };
  league: { name: string; country: string };
  teams: {
    home: { name: string };
    away: { name: string };
  };
};

type ApiSportsOddValue = { value: string; odd: string };
type ApiSportsBet = { id: number; name: string; values: ApiSportsOddValue[] };
type ApiSportsBookmaker = { id: number; name: string; bets: ApiSportsBet[] };

/** Decimal odds → American integer */
export function decimalToAmerican(decimal: number): number {
  if (!Number.isFinite(decimal) || decimal <= 1) return -110;
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

async function apiSportsGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return null;

  const url = new URL(`https://v3.football.api-sports.io${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": apiKey,
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.warn("[api-sports]", path, res.status);
    return null;
  }

  return (await res.json()) as T;
}

/**
 * Pull today's (and optionally tomorrow's) soccer fixtures with Match Winner odds.
 * Caps fixtures to conserve free daily quota (1 fixtures call + N odds calls).
 */
export async function fetchApiSportsSoccerEvents(options?: {
  maxFixtures?: number;
  includeTomorrow?: boolean;
}): Promise<OddsEvent[]> {
  if (!process.env.API_SPORTS_KEY) return [];

  const maxFixtures = options?.maxFixtures ?? 6;
  const includeTomorrow = options?.includeTomorrow ?? true;

  const today = new Date();
  const dates = [today.toISOString().slice(0, 10)];
  if (includeTomorrow) {
    const tmr = new Date(today.getTime() + 864e5);
    dates.push(tmr.toISOString().slice(0, 10));
  }

  const fixtures: ApiSportsFixture[] = [];

  for (const date of dates) {
    if (fixtures.length >= maxFixtures) break;
    const data = await apiSportsGet<{
      results: number;
      response: ApiSportsFixture[];
    }>("/fixtures", { date });

    if (!data?.response?.length) continue;
    for (const f of data.response) {
      fixtures.push(f);
      if (fixtures.length >= maxFixtures) break;
    }
  }

  const events: OddsEvent[] = [];

  for (const f of fixtures) {
    const oddsData = await apiSportsGet<{
      results: number;
      response: Array<{ bookmakers: ApiSportsBookmaker[] }>;
    }>("/odds", { fixture: String(f.fixture.id) });

    const book = oddsData?.response?.[0]?.bookmakers?.[0];
    const matchWinner = book?.bets.find(
      (b) =>
        b.name === "Match Winner" ||
        b.name === "Home/Away" ||
        b.name.toLowerCase().includes("match winner"),
    );

    const markets: OddsEvent["markets"] = [];

    if (matchWinner?.values?.length) {
      const outcomes = matchWinner.values.map((v) => {
        const decimal = Number.parseFloat(v.odd);
        let name = v.value;
        // Map Home/Draw/Away to team names when possible
        if (v.value === "Home") name = f.teams.home.name;
        else if (v.value === "Away") name = f.teams.away.name;
        else if (v.value === "Draw") name = "Draw";
        return {
          name,
          price: decimalToAmerican(decimal),
        };
      });
      markets.push({ key: "h2h", outcomes });
    }

    // Optional totals if present (Over/Under)
    const totals = book?.bets.find(
      (b) => b.name === "Goals Over/Under" || b.name.toLowerCase().includes("over/under"),
    );
    if (totals?.values?.length) {
      const overUnder = totals.values
        .filter((v) => /over|under/i.test(v.value))
        .slice(0, 4)
        .map((v) => {
          const m = v.value.match(/(Over|Under)\s*([\d.]+)/i);
          const decimal = Number.parseFloat(v.odd);
          return {
            name: m ? m[1]!.replace(/^./, (c) => c.toUpperCase()) : v.value,
            price: decimalToAmerican(decimal),
            point: m ? Number.parseFloat(m[2]!) : undefined,
          };
        });
      if (overUnder.length) {
        markets.push({
          key: "totals",
          outcomes: overUnder.map((o) => ({
            name: o.name,
            price: o.price,
            point: o.point,
          })),
        });
      }
    }

    events.push({
      id: `api-sports-soccer-${f.fixture.id}`,
      sport: "SOCCER",
      league: `${f.league.country} — ${f.league.name}`,
      eventName: `${f.teams.away.name} vs ${f.teams.home.name}`,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      commenceTime: f.fixture.date,
      bookmaker: book ? `api-sports:${book.name}` : "api-sports",
      markets:
        markets.length > 0
          ? markets
          : [
              {
                key: "h2h",
                outcomes: [
                  { name: f.teams.home.name, price: -110 },
                  { name: "Draw", price: 240 },
                  { name: f.teams.away.name, price: 200 },
                ],
              },
            ],
      context: {
        notes: ["Source: API-Sports football"],
      },
    });
  }

  return events;
}
