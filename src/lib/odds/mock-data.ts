import type { Sport } from "@prisma/client";

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

/** Deterministic mock slate for development without Odds API keys. */
export function getMockOddsEvents(date = new Date()): OddsEvent[] {
  const day = date.toISOString().slice(0, 10);

  return [
    {
      id: `nfl-${day}-1`,
      sport: "NFL",
      league: "NFL",
      eventName: "Kansas City Chiefs vs Buffalo Bills",
      homeTeam: "Buffalo Bills",
      awayTeam: "Kansas City Chiefs",
      commenceTime: new Date(date.getTime() + 36e5 * 8).toISOString(),
      bookmaker: "mock_draftkings",
      markets: [
        {
          key: "spreads",
          outcomes: [
            { name: "Kansas City Chiefs", price: -110, point: -2.5 },
            { name: "Buffalo Bills", price: -110, point: 2.5 },
          ],
        },
        {
          key: "totals",
          outcomes: [
            { name: "Over", price: -105, point: 48.5 },
            { name: "Under", price: -115, point: 48.5 },
          ],
        },
      ],
      context: {
        injuries: ["Bills WR2 questionable"],
        weather: "Clear, 62°F, wind 8mph",
        lineMove: "Chiefs -1.5 → -2.5 (public on Bills)",
        notes: ["Chiefs 4-1 ATS last 5 vs top defenses"],
      },
    },
    {
      id: `nba-${day}-1`,
      sport: "NBA",
      league: "NBA",
      eventName: "Boston Celtics vs Milwaukee Bucks",
      homeTeam: "Milwaukee Bucks",
      awayTeam: "Boston Celtics",
      commenceTime: new Date(date.getTime() + 36e5 * 10).toISOString(),
      bookmaker: "mock_fanduel",
      markets: [
        {
          key: "h2h",
          outcomes: [
            { name: "Boston Celtics", price: -145 },
            { name: "Milwaukee Bucks", price: +125 },
          ],
        },
        {
          key: "spreads",
          outcomes: [
            { name: "Boston Celtics", price: -110, point: -3.5 },
            { name: "Milwaukee Bucks", price: -110, point: 3.5 },
          ],
        },
      ],
      context: {
        injuries: ["Bucks center out"],
        lineMove: "Celtics -2.5 → -3.5",
        notes: ["Celtics top-5 net rating on road"],
      },
    },
    {
      id: `mlb-${day}-1`,
      sport: "MLB",
      league: "MLB",
      eventName: "Los Angeles Dodgers vs New York Yankees",
      homeTeam: "New York Yankees",
      awayTeam: "Los Angeles Dodgers",
      commenceTime: new Date(date.getTime() + 36e5 * 6).toISOString(),
      bookmaker: "mock_betmgm",
      markets: [
        {
          key: "h2h",
          outcomes: [
            { name: "Los Angeles Dodgers", price: -130 },
            { name: "New York Yankees", price: +110 },
          ],
        },
        {
          key: "totals",
          outcomes: [
            { name: "Over", price: -110, point: 8.5 },
            { name: "Under", price: -110, point: 8.5 },
          ],
        },
      ],
      context: {
        weather: "Roof open, wind out to RF 12mph",
        notes: ["Ace vs Ace matchup", "Yankees bullpen fatigued (high leverage last 2 days)"],
      },
    },
    {
      id: `nhl-${day}-1`,
      sport: "NHL",
      league: "NHL",
      eventName: "Edmonton Oilers vs Colorado Avalanche",
      homeTeam: "Colorado Avalanche",
      awayTeam: "Edmonton Oilers",
      commenceTime: new Date(date.getTime() + 36e5 * 12).toISOString(),
      bookmaker: "mock_caesars",
      markets: [
        {
          key: "h2h",
          outcomes: [
            { name: "Edmonton Oilers", price: +105 },
            { name: "Colorado Avalanche", price: -125 },
          ],
        },
        {
          key: "totals",
          outcomes: [
            { name: "Over", price: -115, point: 6.5 },
            { name: "Under", price: -105, point: 6.5 },
          ],
        },
      ],
      context: {
        injuries: ["Avs top-pairing D day-to-day"],
        notes: ["Both teams top-10 expected goals for"],
      },
    },
    {
      id: `ufc-${day}-1`,
      sport: "UFC",
      league: "UFC",
      eventName: "Lightweight Main Event — Fighter A vs Fighter B",
      homeTeam: "Fighter B",
      awayTeam: "Fighter A",
      commenceTime: new Date(date.getTime() + 36e5 * 30).toISOString(),
      bookmaker: "mock_draftkings",
      markets: [
        {
          key: "h2h",
          outcomes: [
            { name: "Fighter A", price: -160 },
            { name: "Fighter B", price: +135 },
          ],
        },
      ],
      context: {
        notes: [
          "Fighter A significant striking edge",
          "Fighter B strong wrestling / control time",
          "Line opened -140 favorite, now -160",
        ],
      },
    },
    {
      id: `soccer-${day}-1`,
      sport: "SOCCER",
      league: "EPL",
      eventName: "Arsenal vs Liverpool",
      homeTeam: "Arsenal",
      awayTeam: "Liverpool",
      commenceTime: new Date(date.getTime() + 36e5 * 20).toISOString(),
      bookmaker: "mock_pinnacle",
      markets: [
        {
          key: "h2h",
          outcomes: [
            { name: "Arsenal", price: +145 },
            { name: "Draw", price: +240 },
            { name: "Liverpool", price: +175 },
          ],
        },
        {
          key: "totals",
          outcomes: [
            { name: "Over", price: -110, point: 2.5 },
            { name: "Under", price: -110, point: 2.5 },
          ],
        },
      ],
      context: {
        injuries: ["Liverpool CB doubtful"],
        notes: ["Both teams high xG last 5", "Home rest advantage Arsenal"],
      },
    },
  ];
}
