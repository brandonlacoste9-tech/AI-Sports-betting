import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPicksForUser } from "@/lib/picks-access";
import { PLAN_LIMITS } from "@/lib/subscriptions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [picksData, user, perf] = await Promise.all([
    getPicksForUser(session.user.id, session.user.plan),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { bankrollCents: true, unitSizeCents: true, name: true },
    }),
    prisma.performanceSnapshot.findUnique({
      where: { period_sportKey: { period: "all_time", sportKey: "ALL" } },
    }),
  ]);

  const limits = PLAN_LIMITS[session.user.plan];
  const fullAnalytics = limits.fullAnalytics;

  return (
    <DashboardShell
      firstName={user?.name?.split(" ")[0]}
      plan={session.user.plan}
      freeSlotsRemaining={picksData.freeSlotsRemaining}
      todayPicks={serializePicks(picksData.today)}
      historyPicks={serializePicks(picksData.history)}
      perf={{
        wins: perf?.wins ?? 0,
        losses: perf?.losses ?? 0,
        pushes: perf?.pushes ?? 0,
        winRate: perf?.winRate ?? 0,
        unitsProfit: perf?.unitsProfit ?? 0,
        roiPercent: perf?.roiPercent ?? 0,
        totalPicks: perf?.totalPicks ?? 0,
      }}
      fullAnalytics={fullAnalytics}
      bankroll={(user?.bankrollCents ?? 100000) / 100}
      unit={(user?.unitSizeCents ?? 1000) / 100}
    />
  );
}

function serializePicks(
  picks: Awaited<ReturnType<typeof getPicksForUser>>["today"],
) {
  return picks.map((p) => ({
    ...p,
    date: p.date instanceof Date ? p.date.toISOString() : p.date,
    eventStartsAt:
      p.eventStartsAt instanceof Date ? p.eventStartsAt.toISOString() : p.eventStartsAt,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  }));
}
