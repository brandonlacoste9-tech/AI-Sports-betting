/**
 * Partner / affiliate destinations.
 * Keep codes in one place so CTAs stay consistent.
 */
export const STAKE_AFFILIATE_URL = "https://stake.com/?c=RARVnEbv" as const;

export const AFFILIATES = {
  stake: {
    name: "Stake",
    url: STAKE_AFFILIATE_URL,
    rel: "noopener noreferrer sponsored nofollow",
  },
} as const;
