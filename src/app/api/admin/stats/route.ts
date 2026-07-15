import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [userCount, basicCount, proCount, pickCount, perf, recentSubs] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: "BASIC" } }),
      prisma.user.count({ where: { plan: "PRO" } }),
      prisma.pick.count(),
      prisma.performanceSnapshot.findUnique({
        where: { period_sportKey: { period: "all_time", sportKey: "ALL" } },
      }),
      prisma.subscription.findMany({
        where: { status: "ACTIVE", plan: { in: ["BASIC", "PRO"] } },
        select: { plan: true },
      }),
    ]);

  // Rough MRR estimate from plan prices
  const mrr =
    recentSubs.reduce((sum, s) => sum + (s.plan === "PRO" ? 49 : 19), 0) ||
    basicCount * 19 + proCount * 49;

  return NextResponse.json({
    users: userCount,
    plans: { free: userCount - basicCount - proCount, basic: basicCount, pro: proCount },
    picks: pickCount,
    estimatedMrr: mrr,
    performance: perf,
  });
}
