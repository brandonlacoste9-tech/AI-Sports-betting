import type { Plan } from "@prisma/client";
import { prisma } from "@/lib/db";

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Resolve a promo: DB first, then env fallback PROMO_CODE_PRO (grants PRO).
 */
export async function resolvePromoCode(raw: string): Promise<{
  ok: true;
  code: string;
  plan: Plan;
  promoCodeId: string | null; // null = env-only code
} | { ok: false; error: string }> {
  const code = normalizePromoCode(raw);
  if (!code || code.length < 4) {
    return { ok: false, error: "Enter a valid promo code" };
  }

  const db = await prisma.promoCode.findUnique({ where: { code } });
  if (db) {
    if (!db.active) return { ok: false, error: "This promo code is inactive" };
    if (db.expiresAt && db.expiresAt < new Date()) {
      return { ok: false, error: "This promo code has expired" };
    }
    if (db.maxRedemptions != null && db.redemptionCount >= db.maxRedemptions) {
      return { ok: false, error: "This promo code has reached its redemption limit" };
    }
    return { ok: true, code: db.code, plan: db.plan, promoCodeId: db.id };
  }

  // Env founder / ops codes (comma-separated). Default includes BETEDGE-PRO-OWNER
  const envList = (
    process.env.PROMO_CODE_PRO ??
    process.env.PROMO_CODES_PRO ??
    "BETEDGE-PRO-OWNER"
  )
    .split(",")
    .map((c) => normalizePromoCode(c))
    .filter(Boolean);

  if (envList.includes(code)) {
    return { ok: true, code, plan: "PRO", promoCodeId: null };
  }

  return { ok: false, error: "Invalid promo code" };
}

export async function redeemPromoForUser(userId: string, rawCode: string) {
  const resolved = await resolvePromoCode(rawCode);
  if (!resolved.ok) return resolved;

  if (resolved.promoCodeId) {
    const existing = await prisma.promoRedemption.findUnique({
      where: {
        promoCodeId_userId: {
          promoCodeId: resolved.promoCodeId,
          userId,
        },
      },
    });
    if (existing) {
      return { ok: false as const, error: "You already redeemed this promo code" };
    }
  }

  const periodEnd = new Date();
  periodEnd.setFullYear(periodEnd.getFullYear() + 10); // long-lived promo grant

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { plan: resolved.plan },
    });

    await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: resolved.plan,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        // Mark as promo so Stripe portal isn't required
        stripePriceId: `promo:${resolved.code}`,
      },
      update: {
        plan: resolved.plan,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        stripePriceId: `promo:${resolved.code}`,
      },
    });

    if (resolved.promoCodeId) {
      await tx.promoRedemption.create({
        data: {
          promoCodeId: resolved.promoCodeId,
          userId,
        },
      });
      await tx.promoCode.update({
        where: { id: resolved.promoCodeId },
        data: { redemptionCount: { increment: 1 } },
      });
    }
  });

  return {
    ok: true as const,
    plan: resolved.plan,
    code: resolved.code,
  };
}
