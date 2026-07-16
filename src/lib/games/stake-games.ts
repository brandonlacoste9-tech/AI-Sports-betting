import {
  stakeCasinoGameUrl,
  stakeCasinoUrl,
  stakeSlotsUrl,
  stakeSportsUrl,
} from "@/lib/affiliates";

const STAKE_GRAPHQL = "https://stake.com/_api/graphql";

export type StakeGameCategory = "slots" | "table" | "instant";

type CatalogEntry = {
  slug: string;
  category: StakeGameCategory;
  blurb: string;
};

/**
 * Stake games verified via GraphQL slugKuratorGame.
 * "slots" = slot-style / reels / grid / pack openers.
 */
export const STAKE_GAME_CATALOG: CatalogEntry[] = [
  // Slot-style / reels & packs
  { slug: "diamonds", category: "slots", blurb: "Slot-style Stake Original — match diamonds." },
  { slug: "bars", category: "slots", blurb: "Classic bars slot Original on Stake." },
  { slug: "cases", category: "slots", blurb: "Open cases for multipliers & prizes." },
  { slug: "packs", category: "slots", blurb: "Pack openings — chase rare hits." },
  { slug: "pump", category: "slots", blurb: "Pump the multiplier — cash out in time." },
  { slug: "plinko", category: "slots", blurb: "Drop chips down the Plinko board." },
  { slug: "mines", category: "slots", blurb: "Grid reveal — avoid the mines." },
  { slug: "keno", category: "slots", blurb: "Pick numbers, hit the draw." },
  { slug: "wheel", category: "slots", blurb: "Spin the multiplier wheel." },
  { slug: "limbo", category: "slots", blurb: "Set a target multiplier and go." },
  { slug: "slide", category: "slots", blurb: "Ride the Slide multiplier." },
  { slug: "snakes", category: "slots", blurb: "Snakes Original — climb the board." },
  { slug: "dragon-tower", category: "slots", blurb: "Climb Dragon Tower for bigger pays." },
  { slug: "tome-of-life", category: "slots", blurb: "Tome of Life — page through multipliers." },
  { slug: "chicken", category: "slots", blurb: "Chicken Original — how far do you go?" },
  // Table
  { slug: "blackjack", category: "table", blurb: "Stake Original blackjack." },
  { slug: "roulette", category: "table", blurb: "Stake Original roulette." },
  { slug: "baccarat", category: "table", blurb: "Stake Original baccarat." },
  { slug: "video-poker", category: "table", blurb: "Video poker on Stake." },
  { slug: "poker", category: "table", blurb: "Poker Original on Stake." },
  { slug: "hilo", category: "table", blurb: "Higher or lower card streak." },
  // Instant / crash-style
  { slug: "dice", category: "instant", blurb: "Classic dice — target & multiplier." },
  { slug: "crash", category: "instant", blurb: "Cash out before crash." },
  { slug: "flip", category: "instant", blurb: "Coin flip Original." },
  { slug: "rock-paper-scissors", category: "instant", blurb: "RPS with multipliers." },
  { slug: "tarot", category: "instant", blurb: "Tarot cards Original." },
  { slug: "darts", category: "instant", blurb: "Darts Original on Stake." },
];

export type StakeGameCard = {
  id: string;
  name: string;
  slug: string;
  category: StakeGameCategory;
  thumbnailUrl: string | null;
  edge: number | null;
  href: string;
  blurb: string;
};

type GqlGame = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string | null;
  edge?: number | null;
};

function stakeApiKey(): string | null {
  return process.env.STAKE_API_KEY?.trim() || null;
}

async function fetchKuratorGame(slug: string): Promise<GqlGame | null> {
  const key = stakeApiKey();
  if (!key) return null;

  try {
    const res = await fetch(STAKE_GRAPHQL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-access-token": key,
        "user-agent": "BetEdgeAI/1.0",
      },
      body: JSON.stringify({
        query: `
          query ($slug: String!) {
            slugKuratorGame(slug: $slug) {
              id
              name
              slug
              thumbnailUrl
              edge
            }
          }
        `,
        variables: { slug },
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { slugKuratorGame: GqlGame | null };
      errors?: unknown[];
    };
    if (json.errors?.length) return null;
    return json.data?.slugKuratorGame ?? null;
  } catch {
    return null;
  }
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Load Stake casino games for BetEdge /games (slots + table + instant).
 * Real-money play opens on Stake with affiliate code.
 */
export async function getStakeGamesForHub(): Promise<{
  games: StakeGameCard[];
  slots: StakeGameCard[];
  table: StakeGameCard[];
  instant: StakeGameCard[];
  sportsHref: string;
  slotsHref: string;
  casinoHref: string;
  source: "stake-api" | "static";
}> {
  const sportsHref = stakeSportsUrl();
  const slotsHref = stakeSlotsUrl();
  const casinoHref = stakeCasinoUrl();
  const games: StakeGameCard[] = [];
  let anyLive = false;

  await Promise.all(
    STAKE_GAME_CATALOG.map(async (entry) => {
      const live = await fetchKuratorGame(entry.slug);
      if (live) anyLive = true;
      const name = live?.name ? titleCase(live.name) : titleCase(entry.slug);
      games.push({
        id: live?.id ?? `stake-${entry.slug}`,
        name,
        slug: entry.slug,
        category: entry.category,
        thumbnailUrl: live?.thumbnailUrl ?? null,
        edge: live?.edge ?? null,
        href: stakeCasinoGameUrl(entry.slug),
        blurb: entry.blurb,
      });
    }),
  );

  const order = new Map(STAKE_GAME_CATALOG.map((e, i) => [e.slug, i]));
  games.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));

  return {
    games,
    slots: games.filter((g) => g.category === "slots"),
    table: games.filter((g) => g.category === "table"),
    instant: games.filter((g) => g.category === "instant"),
    sportsHref,
    slotsHref,
    casinoHref,
    source: anyLive ? "stake-api" : "static",
  };
}
