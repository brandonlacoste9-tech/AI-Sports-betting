import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPicksForUser } from "@/lib/picks-access";
import { PLAN_LIMITS } from "@/lib/subscriptions";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import { PicksList } from "@/components/dashboard/picks-list";
import { PerformanceCard } from "@/components/dashboard/performance-card";
import { BankrollCalculator } from "@/components/dashboard/bankroll-calculator";

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
    <div className="bg-grid mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hey{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-muted">Today&apos;s AI board · NFL → Soccer priority</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{session.user.plan} plan</Badge>
          {picksData.freeSlotsRemaining !== null && (
            <Badge variant="muted">{picksData.freeSlotsRemaining} free unlocks left</Badge>
          )}
        </div>
      </div>

      <Disclaimer />

      <PerformanceCard
        wins={perf?.wins ?? 0}
        losses={perf?.losses ?? 0}
        pushes={perf?.pushes ?? 0}
        winRate={perf?.winRate ?? 0}
        unitsProfit={perf?.unitsProfit ?? 0}
        roiPercent={perf?.roiPercent ?? 0}
        totalPicks={perf?.totalPicks ?? 0}
        limited={!fullAnalytics}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <PicksList title="Today's picks" picks={serializePicks(picksData.today)} />
          <PicksList
            title="Recent history"
            picks={serializePicks(picksData.history)}
            emptyMessage="No historical picks in your plan window."
          />
        </div>
        <div className="lg:col-span-2">
          <BankrollCalculator
            defaultBankroll={(user?.bankrollCents ?? 100000) / 100}
            defaultUnit={(user?.unitSizeCents ?? 1000) / 100}
          />
        </div>
      </div>
    </div>
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
