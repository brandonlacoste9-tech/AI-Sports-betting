import type { Plan, Pick } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/subscriptions";
import { utcDateOnly } from "@/lib/utils";

export type PublicPick = Omit<Pick, "rawPayload"> & {
  locked?: boolean;
  reasoning?: string | null;
};

/**
 * Apply freemium gating: free users see 1 unlockable pick/day;
 * premium picks require PRO; reasoning may be truncated when locked.
 */
export async function getPicksForUser(userId: string, plan: Plan) {
  const limits = PLAN_LIMITS[plan];
  const today = utcDateOnly();

  const historyStart = new Date(today);
  historyStart.setUTCDate(historyStart.getUTCDate() - limits.historyDays);

  const picks = await prisma.pick.findMany({
    where: {
      date: { gte: historyStart },
      ...(plan === "FREE" || plan === "BASIC"
        ? // Free/Basic still list premium rows but may lock content
          {}
        : {}),
    },
    orderBy: [{ date: "desc" }, { confidence: "desc" }],
    take: plan === "FREE" ? 40 : 200,
  });

  const todayViews = await prisma.pickView.findMany({
    where: {
      userId,
      viewedAt: { gte: today },
    },
    select: { pickId: true },
  });
  const viewedIds = new Set(todayViews.map((v) => v.pickId));

  const todayPicks = picks.filter((p) => p.date.getTime() === today.getTime());
  const historyPicks = picks.filter((p) => p.date.getTime() !== today.getTime());

  let freeSlotsRemaining =
    limits.picksPerDay === Infinity
      ? Infinity
      : Math.max(0, limits.picksPerDay - viewedIds.size);

  // Free tier: auto-unlock first eligible non-premium pick of the day and record view
  if (limits.picksPerDay !== Infinity && freeSlotsRemaining > 0) {
    const auto = todayPicks.find(
      (p) => !viewedIds.has(p.id) && !(p.isPremium && !limits.premiumPicks),
    );
    if (auto) {
      await prisma.pickView.upsert({
        where: { userId_pickId: { userId, pickId: auto.id } },
        create: { userId, pickId: auto.id },
        update: {},
      });
      viewedIds.add(auto.id);
      freeSlotsRemaining = Math.max(0, freeSlotsRemaining - 1);
    }
  }

  const mapPick = (pick: Pick): PublicPick => {
    const { rawPayload: _raw, ...rest } = pick;
    void _raw;

    // Premium content gate
    if (pick.isPremium && !limits.premiumPicks) {
      return {
        ...rest,
        locked: true,
        reasoning: "Upgrade to Pro to unlock premium high-edge picks and full reasoning.",
        keyFactors: [],
      };
    }

    if (limits.picksPerDay === Infinity) {
      return { ...rest, locked: false };
    }

    // Free tier: already viewed today stays unlocked
    if (viewedIds.has(pick.id)) {
      return { ...rest, locked: false };
    }

    return {
      ...rest,
      locked: true,
      reasoning: "Upgrade to Basic or Pro for unlimited daily picks.",
      keyFactors: [],
      pickSide: "••••••••",
      oddsAmerican: 0,
      confidence: 0,
      edgePercent: 0,
    };
  };

  return {
    today: todayPicks.map((p) => mapPick(p)),
    history: historyPicks.map((p) => mapPick(p)),
    freeSlotsRemaining: freeSlotsRemaining === Infinity ? null : freeSlotsRemaining,
    plan,
  };
}

/** Record a free-tier view so the pick stays unlocked for the day. */
export async function recordPickView(userId: string, pickId: string, plan: Plan) {
  if (PLAN_LIMITS[plan].picksPerDay === Infinity) return { ok: true as const };

  const today = utcDateOnly();
  const viewsToday = await prisma.pickView.count({
    where: { userId, viewedAt: { gte: today } },
  });

  const existing = await prisma.pickView.findUnique({
    where: { userId_pickId: { userId, pickId } },
  });
  if (existing) return { ok: true as const };

  if (viewsToday >= PLAN_LIMITS[plan].picksPerDay) {
    return { ok: false as const, error: "Daily free pick limit reached" };
  }

  await prisma.pickView.create({ data: { userId, pickId } });
  return { ok: true as const };
}
