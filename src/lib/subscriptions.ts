import type { Plan } from "@prisma/client";

export const PLAN_LIMITS = {
  FREE: {
    label: "Free",
    priceMonthly: 0,
    picksPerDay: 1,
    historyDays: 7,
    fullAnalytics: false,
    premiumPicks: false,
  },
  BASIC: {
    label: "Basic",
    priceMonthly: 19,
    picksPerDay: Infinity,
    historyDays: 365,
    fullAnalytics: true,
    premiumPicks: false,
  },
  PRO: {
    label: "Pro",
    priceMonthly: 49,
    picksPerDay: Infinity,
    historyDays: 3650,
    fullAnalytics: true,
    premiumPicks: true,
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
