import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminClient } from "./admin-client";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [users, stats, recentPicks, pendingPicks, basicAll, proAll, userCount] =
    await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          plan: true,
          createdAt: true,
          subscription: { select: { status: true } },
        },
      }),
      prisma.performanceSnapshot.findUnique({
        where: { period_sportKey: { period: "all_time", sportKey: "ALL" } },
      }),
      prisma.pick.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          sport: true,
          eventName: true,
          pickSide: true,
          confidence: true,
          isPremium: true,
          date: true,
          modelVersion: true,
          result: true,
          oddsAmerican: true,
          profitUnits: true,
        },
      }),
      prisma.pick.findMany({
        where: { result: "PENDING" },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 40,
        select: {
          id: true,
          sport: true,
          eventName: true,
          pickSide: true,
          confidence: true,
          isPremium: true,
          date: true,
          modelVersion: true,
          result: true,
          oddsAmerican: true,
          profitUnits: true,
        },
      }),
      prisma.user.count({ where: { plan: "BASIC" } }),
      prisma.user.count({ where: { plan: "PRO" } }),
      prisma.user.count(),
    ]);

  const mapPick = (p: (typeof recentPicks)[number]) => ({
    ...p,
    date: p.date.toISOString(),
  });

  return (
    <div className="bg-grid mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
        <p className="mt-1 text-muted">
          Users, pick generation, grading, digests, revenue snapshot
        </p>
      </div>
      <AdminClient
        stats={{
          users: userCount,
          basic: basicAll,
          pro: proAll,
          estimatedMrr: basicAll * 19 + proAll * 49,
          performance: stats
            ? {
                winRate: stats.winRate,
                unitsProfit: stats.unitsProfit,
                totalPicks: stats.totalPicks,
              }
            : null,
        }}
        users={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        }))}
        recentPicks={recentPicks.map(mapPick)}
        pendingPicks={pendingPicks.map(mapPick)}
      />
    </div>
  );
}
