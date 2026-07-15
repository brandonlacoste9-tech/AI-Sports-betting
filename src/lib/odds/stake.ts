import type { Sport } from "@prisma/client";
import type { OddsEvent } from "@/lib/odds/types";

const STAKE_GRAPHQL = "https://stake.com/_api/graphql";

/** Primary Stake sport slug + preferred tournament slug(s). */
const SPORT_TOURNAMENTS: Record<
  Sport,
  { sportSlug: string; tournamentSlugs: string[] }
> = {
  NFL: { sportSlug: "american-football", tournamentSlugs: ["nfl"] },
  NBA: { sportSlug: "basketball", tournamentSlugs: ["nba", "nba-summer-league", "wnba"] },
  MLB: { sportSlug: "baseball", tournamentSlugs: ["mlb"] },
  NHL: { sportSlug: "ice-hockey", tournamentSlugs: ["nhl"] },
  UFC: { sportSlug: "mma", tournamentSlugs: [] }, // resolved dynamically (UFC cards)
  SOCCER: {
    sportSlug: "soccer",
    tournamentSlugs: [
      "english-premier-league",
      "uefa-champions-league",
      "uefa-europa-league",
      "la-liga",
      "serie-a",
      "bundesliga",
      "ligue-1",
      "mls",
    ],
  },
};

type GqlResponse<T> = { data?: T; errors?: Array<{ message: string }> };

type StakeCompetitor = { name: string };
type StakeOutcome = { id: string; name: string; odds: number; active: boolean };
type StakeMarket = {
  name: string;
  status: string;
  outcomes: StakeOutcome[];
};
type StakeTemplate = {
  name: string;
  extId: string;
  markets: StakeMarket[];
};
type StakeGroup = { name: string; templates: StakeTemplate[] };
type StakeFixture = {
  id: string;
  name: string;
  status: string;
  slug: string;
  data?: {
    startTime?: string;
    competitors?: StakeCompetitor[];
  };
  groups?: StakeGroup[];
};

function stakeApiKey(): string | null {
  return process.env.STAKE_API_KEY?.trim() || null;
}

export function hasStakeApi(): boolean {
  return Boolean(stakeApiKey());
}

async function stakeGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T | null> {
  const key = stakeApiKey();
  if (!key) return null;

  const res = await fetch(STAKE_GRAPHQL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-access-token": key,
      "user-agent": "BetEdgeAI/1.0",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 120 },
  });

  if (!res.ok) {
    console.warn("[stake] http", res.status);
    return null;
  }

  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) {
    console.warn("[stake] graphql", json.errors.map((e) => e.message).join("; "));
    return null;
  }
  return json.data ?? null;
}

/** Decimal odds → American integer. */
export function decimalToAmerican(decimal: number): number {
  if (!Number.isFinite(decimal) || decimal <= 1) return -10000;
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

/**
 * Pull live Stake lines for BetEdge sports and normalize to OddsEvent[].
 */
export async function fetchStakeOddsEvents(
  sports?: Sport[],
  options?: { maxFixturesPerSport?: number },
): Promise<OddsEvent[]> {
  if (!hasStakeApi()) return [];

  const target = sports ?? (Object.keys(SPORT_TOURNAMENTS) as Sport[]);
  const maxPer = options?.maxFixturesPerSport ?? 4;
  const out: OddsEvent[] = [];

  for (const sport of target) {
    try {
      const events = await fetchSportEvents(sport, maxPer);
      out.push(...events);
    } catch (err) {
      console.warn(`[stake] ${sport} error`, err);
    }
  }

  return out;
}

async function fetchSportEvents(
  sport: Sport,
  maxFixtures: number,
): Promise<OddsEvent[]> {
  const cfg = SPORT_TOURNAMENTS[sport];
  if (!cfg) return [];

  const tournamentIds = await resolveTournamentIds(cfg.sportSlug, cfg.tournamentSlugs, sport);
  if (tournamentIds.length === 0) return [];

  const fixtures: Array<{ fixture: StakeFixture; league: string }> = [];

  for (const t of tournamentIds) {
    const data = await stakeGraphql<{
      sportTournament: {
        id: string;
        name: string;
        fixtureList: StakeFixture[];
      } | null;
    }>(`
      query ($tournamentId: String!) {
        sportTournament(tournamentId: $tournamentId) {
          id
          name
          fixtureList {
            id
            name
            status
            slug
            data {
              ... on SportFixtureDataMatch {
                startTime
                competitors { name }
              }
            }
          }
        }
      }
    `, { tournamentId: t.id });

    const list = data?.sportTournament?.fixtureList ?? [];
    const league = data?.sportTournament?.name ?? t.name;
    for (const f of list) {
      if (f.status !== "active") continue;
      // Skip pure outrights without two competitors
      const comps = f.data?.competitors ?? [];
      if (comps.length < 2 && !f.name.includes(" - ")) continue;
      fixtures.push({ fixture: f, league });
    }
  }

  // Prefer soonest start
  fixtures.sort((a, b) => {
    const ta = Date.parse(a.fixture.data?.startTime ?? "") || Number.MAX_SAFE_INTEGER;
    const tb = Date.parse(b.fixture.data?.startTime ?? "") || Number.MAX_SAFE_INTEGER;
    return ta - tb;
  });

  const selected = fixtures.slice(0, maxFixtures);
  const events: OddsEvent[] = [];

  for (const { fixture, league } of selected) {
    const detailed = await fetchFixtureMarkets(fixture.id);
    if (!detailed) continue;
    const mapped = mapFixtureToEvent(sport, league, detailed);
    if (mapped) events.push(mapped);
  }

  return events;
}

async function resolveTournamentIds(
  sportSlug: string,
  preferredSlugs: string[],
  sport: Sport,
): Promise<Array<{ id: string; name: string; slug: string }>> {
  const data = await stakeGraphql<{
    slugSport: {
      tournamentList: Array<{ id: string; name: string; slug: string }>;
    } | null;
  }>(`
    query ($sport: String!) {
      slugSport(sport: $sport) {
        tournamentList { id name slug }
      }
    }
  `, { sport: sportSlug });

  const all = data?.slugSport?.tournamentList ?? [];
  if (all.length === 0) return [];

  if (sport === "UFC") {
    const ufc = all.filter(
      (t) =>
        t.slug.includes("ufc") ||
        t.name.toLowerCase().includes("ufc"),
    );
    return (ufc.length ? ufc : all).slice(0, 2);
  }

  if (preferredSlugs.length === 0) return all.slice(0, 1);

  const matched = preferredSlugs
    .map((slug) => all.find((t) => t.slug === slug))
    .filter((t): t is { id: string; name: string; slug: string } => Boolean(t));

  if (matched.length) return matched;

  // Fallback: first tournament on the sport
  return all.slice(0, 1);
}

async function fetchFixtureMarkets(fixtureId: string): Promise<StakeFixture | null> {
  const data = await stakeGraphql<{ sportFixture: StakeFixture | null }>(`
    query ($fixtureId: String!) {
      sportFixture(fixtureId: $fixtureId) {
        id
        name
        status
        slug
        data {
          ... on SportFixtureDataMatch {
            startTime
            competitors { name }
          }
        }
        groups {
          name
          templates {
            name
            extId
            markets {
              name
              status
              outcomes {
                id
                name
                odds
                active
              }
            }
          }
        }
      }
    }
  `, { fixtureId });

  return data?.sportFixture ?? null;
}

function mapFixtureToEvent(
  sport: Sport,
  league: string,
  fixture: StakeFixture,
): OddsEvent | null {
  const comps = fixture.data?.competitors ?? [];
  let homeTeam = comps[0]?.name ?? "";
  let awayTeam = comps[1]?.name ?? "";

  // Stake lists home first in competitors; event name is often "Home - Away"
  if ((!homeTeam || !awayTeam) && fixture.name.includes(" - ")) {
    const [a, b] = fixture.name.split(" - ").map((s) => s.trim());
    homeTeam = homeTeam || a || "Home";
    awayTeam = awayTeam || b || "Away";
  }
  if (!homeTeam || !awayTeam) return null;

  const mainGroup =
    fixture.groups?.find((g) => g.name.toLowerCase() === "main") ??
    fixture.groups?.[0];
  if (!mainGroup) return null;

  const markets: OddsEvent["markets"] = [];

  const h2h = pickH2h(mainGroup, homeTeam, awayTeam);
  if (h2h) markets.push(h2h);

  const spread = pickSpread(mainGroup);
  if (spread) markets.push(spread);

  const total = pickTotal(mainGroup);
  if (total) markets.push(total);

  if (markets.length === 0) return null;

  const commence =
    fixture.data?.startTime
      ? new Date(fixture.data.startTime).toISOString()
      : new Date().toISOString();

  return {
    id: `stake_${fixture.id}`,
    sport,
    league,
    eventName: `${awayTeam} vs ${homeTeam}`,
    homeTeam,
    awayTeam,
    commenceTime: commence,
    bookmaker: "stake",
    markets,
    context: {
      notes: ["Odds from Stake (affiliate partner book)"],
    },
  };
}

function activeOutcomes(market: StakeMarket): StakeOutcome[] {
  return (market.outcomes ?? []).filter((o) => o.active && o.odds > 1);
}

function pickH2h(
  group: StakeGroup,
  homeTeam: string,
  awayTeam: string,
): OddsEvent["markets"][number] | null {
  const templates = group.templates.filter((t) => {
    const n = t.name.toLowerCase();
    return (
      n.includes("winner") ||
      n === "1x2" ||
      n.includes("moneyline") ||
      n.includes("match winner")
    );
  });

  for (const t of templates) {
    for (const m of t.markets) {
      if (m.status !== "active") continue;
      const outs = activeOutcomes(m).filter(
        (o) => !/^draw$/i.test(o.name) && !/tie/i.test(o.name),
      );
      // Prefer two-way
      if (outs.length >= 2) {
        const two = outs.slice(0, 2);
        return {
          key: "h2h",
          outcomes: two.map((o) => ({
            name: normalizeTeamName(o.name, homeTeam, awayTeam),
            price: decimalToAmerican(o.odds),
          })),
        };
      }
    }
  }
  return null;
}

function pickSpread(group: StakeGroup): OddsEvent["markets"][number] | null {
  const templates = group.templates.filter((t) =>
    t.name.toLowerCase().includes("handicap"),
  );
  const candidates: Array<{
    outcomes: { name: string; price: number; point?: number }[];
    score: number;
  }> = [];

  for (const t of templates) {
    for (const m of t.markets) {
      if (m.status !== "active") continue;
      const outs = activeOutcomes(m);
      if (outs.length < 2) continue;
      const mapped = outs.slice(0, 2).map((o) => {
        const point = parseSignedPoint(o.name);
        return {
          name: stripPoint(o.name),
          price: decimalToAmerican(o.odds),
          point: point ?? undefined,
        };
      });
      if (mapped.some((x) => x.point == null)) continue;
      const score = Math.abs(outs[0].odds - outs[1].odds);
      candidates.push({ outcomes: mapped, score });
    }
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => a.score - b.score);
  return { key: "spreads", outcomes: candidates[0].outcomes };
}

function pickTotal(group: StakeGroup): OddsEvent["markets"][number] | null {
  const templates = group.templates.filter((t) => {
    const n = t.name.toLowerCase();
    return n.includes("total") || n.includes("over/under");
  });
  const candidates: Array<{
    outcomes: { name: string; price: number; point?: number }[];
    score: number;
  }> = [];

  for (const t of templates) {
    for (const m of t.markets) {
      if (m.status !== "active") continue;
      const outs = activeOutcomes(m);
      const over = outs.find((o) => /^over\b/i.test(o.name));
      const under = outs.find((o) => /^under\b/i.test(o.name));
      if (!over || !under) continue;
      const point =
        parseUnsignedPoint(over.name) ?? parseUnsignedPoint(under.name);
      if (point == null) continue;
      candidates.push({
        outcomes: [
          { name: "Over", price: decimalToAmerican(over.odds), point },
          { name: "Under", price: decimalToAmerican(under.odds), point },
        ],
        score: Math.abs(over.odds - under.odds),
      });
    }
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => a.score - b.score);
  return { key: "totals", outcomes: candidates[0].outcomes };
}

function parseSignedPoint(name: string): number | null {
  const m = name.match(/\(([+-]?\d+(?:\.\d+)?)\)\s*$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function parseUnsignedPoint(name: string): number | null {
  const m = name.match(/(?:over|under)\s+(\d+(?:\.\d+)?)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function stripPoint(name: string): string {
  return name.replace(/\s*\([+-]?\d+(?:\.\d+)?\)\s*$/, "").trim();
}

function normalizeTeamName(
  outcomeName: string,
  homeTeam: string,
  awayTeam: string,
): string {
  const cleaned = stripPoint(outcomeName);
  if (/home/i.test(cleaned)) return homeTeam;
  if (/away/i.test(cleaned)) return awayTeam;
  return cleaned;
}
