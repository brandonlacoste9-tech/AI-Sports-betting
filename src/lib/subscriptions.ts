import type { Plan } from "@prisma/client";

export const PLAN_LIMITS = {
  FREE: {
    label: "Free",
    priceMonthly: 0,
    picksPerDay: 1,
    historyDays: 7,
    fullAnalytics: false,
    premiumPicks: false,
    lineMoves: false,
    apiRequestsPerDay: 100,
    maxApiKeys: 1,
  },
  BASIC: {
    label: "Basic",
    priceMonthly: 19,
    picksPerDay: Infinity,
    historyDays: 365,
    fullAnalytics: true,
    premiumPicks: false,
    lineMoves: true,
    apiRequestsPerDay: 2_000,
    maxApiKeys: 2,
  },
  PRO: {
    label: "Pro",
    priceMonthly: 49,
    picksPerDay: Infinity,
    historyDays: 3650,
    fullAnalytics: true,
    premiumPicks: true,
    lineMoves: true,
    apiRequestsPerDay: 20_000,
    maxApiKeys: 5,
  },
} as const satisfies Record<
  Plan,
  {
    label: string;
    priceMonthly: number;
    picksPerDay: number;
    historyDays: number;
    fullAnalytics: boolean;
    premiumPicks: boolean;
    lineMoves: boolean;
    apiRequestsPerDay: number;
    maxApiKeys: number;
  }
>;

export function planFromStripePriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "FREE";
  if (process.env.STRIPE_PRICE_PRO && priceId === process.env.STRIPE_PRICE_PRO) {
    return "PRO";
  }
  if (process.env.STRIPE_PRICE_BASIC && priceId === process.env.STRIPE_PRICE_BASIC) {
    return "BASIC";
  }
  return "FREE";
}

export function isPaidPlan(plan: Plan): boolean {
  return plan === "BASIC" || plan === "PRO";
}
