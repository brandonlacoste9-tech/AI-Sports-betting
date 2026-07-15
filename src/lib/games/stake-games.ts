import { stakeCasinoGameUrl, stakeSportsUrl } from "@/lib/affiliates";

const STAKE_GRAPHQL = "https://stake.com/_api/graphql";

/** Stake Originals we surface on BetEdge (verified via GraphQL). */
export const STAKE_ORIGINAL_SLUGS = [
  "dice",
  "crash",
  "plinko",
  "mines",
  "keno",
  "hilo",
  "wheel",
  "limbo",
  "blackjack",
  "roulette",
  "baccarat",
  "slide",
] as const;

export type StakeGameCard = {
  id: string;
  name: string;
  slug: string;
  category: "originals" | "sports";
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
    };
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

const BLURBS: Record<string, string> = {
  dice: "Classic Stake Original — set target & multiplier.",
  crash: "Cash out before the rocket crashes.",
  plinko: "Drop chips, chase multipliers.",
  mines: "Clear the grid without hitting a mine.",
  keno: "Pick numbers, hit the draw.",
  hilo: "Higher or lower — ride the streak.",
  wheel: "Spin for multiplier payouts.",
  limbo: "Pick a target multiplier and go.",
  blackjack: "Stake Original blackjack.",
  roulette: "Stake Original roulette.",
  baccarat: "Stake Original baccarat.",
  slide: "Ride the multiplier on Slide.",
};

/**
 * Load Stake games for the BetEdge /games hub.
 * All play-through happens on Stake (affiliate deep links).
 */
export async function getStakeGamesForHub(): Promise<{
  games: StakeGameCard[];
  sportsHref: string;
  source: "stake-api" | "static";
}> {
  const sportsHref = stakeSportsUrl();
  const games: StakeGameCard[] = [];
  let anyLive = false;

  await Promise.all(
    STAKE_ORIGINAL_SLUGS.map(async (slug) => {
      const live = await fetchKuratorGame(slug);
      if (live) anyLive = true;
      const name = live?.name ? titleCase(live.name) : titleCase(slug);
      games.push({
        id: live?.id ?? `stake-${slug}`,
        name,
        slug,
        category: "originals",
        thumbnailUrl: live?.thumbnailUrl ?? null,
        edge: live?.edge ?? null,
        href: stakeCasinoGameUrl(slug),
        blurb: BLURBS[slug] ?? "Play on Stake — affiliate partner.",
      });
    }),
  );

  // Stable order matching catalog
  games.sort(
    (a, b) =>
      STAKE_ORIGINAL_SLUGS.indexOf(a.slug as (typeof STAKE_ORIGINAL_SLUGS)[number]) -
      STAKE_ORIGINAL_SLUGS.indexOf(b.slug as (typeof STAKE_ORIGINAL_SLUGS)[number]),
  );

  return {
    games,
    sportsHref,
    source: anyLive ? "stake-api" : "static",
  };
}
