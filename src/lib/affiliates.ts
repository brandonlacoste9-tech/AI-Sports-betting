/**
 * Partner / affiliate destinations.
 * Keep codes in one place so CTAs stay consistent.
 */
export const STAKE_AFFILIATE_CODE = "RARVnEbv" as const;
export const STAKE_AFFILIATE_URL =
  `https://stake.com/?c=${STAKE_AFFILIATE_CODE}` as const;

export const AFFILIATES = {
  stake: {
    name: "Stake",
    url: STAKE_AFFILIATE_URL,
    rel: "noopener noreferrer sponsored nofollow",
  },
} as const;

/** Deep link into a Stake casino game with affiliate code. */
export function stakeCasinoGameUrl(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return `https://stake.com/casino/games/${encodeURIComponent(clean)}?c=${STAKE_AFFILIATE_CODE}`;
}

/** Stake slots lobby. */
export function stakeSlotsUrl(): string {
  return `https://stake.com/casino/group/slots?c=${STAKE_AFFILIATE_CODE}`;
}

/** Stake casino home / full lobby. */
export function stakeCasinoUrl(): string {
  return `https://stake.com/casino/home?c=${STAKE_AFFILIATE_CODE}`;
}

/** Stake sportsbook home with affiliate code. */
export function stakeSportsUrl(): string {
  return `https://stake.com/sports/home?c=${STAKE_AFFILIATE_CODE}`;
}
