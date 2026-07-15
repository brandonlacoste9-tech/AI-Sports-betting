import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format American odds for display (+150 / -110). */
export function formatAmericanOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

/** Convert cents to USD string. */
export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** Decimal odds from American. */
export function americanToDecimal(american: number): number {
  if (american > 0) return american / 100 + 1;
  return 100 / Math.abs(american) + 1;
}

/** Implied probability from American odds (0–1). */
export function impliedProbability(american: number): number {
  if (american > 0) return 100 / (american + 100);
  return Math.abs(american) / (Math.abs(american) + 100);
}

/** Profit units for a graded pick at 1 unit stake. */
export function unitsFromOdds(american: number, result: "WIN" | "LOSS" | "PUSH" | "VOID"): number {
  if (result === "PUSH" || result === "VOID") return 0;
  if (result === "LOSS") return -1;
  const decimal = americanToDecimal(american);
  return decimal - 1;
}

/** UTC calendar date at midnight for slate grouping. */
export function utcDateOnly(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
