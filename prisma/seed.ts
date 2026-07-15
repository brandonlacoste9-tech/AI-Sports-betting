import { PrismaClient, type PickResult, type Sport } from "@prisma/client";
import bcrypt from "bcryptjs";
import { unitsFromOdds, utcDateOnly } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@betedge.ai").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMeAdmin123!";
  const demoEmail = "demo@betedge.ai";
  const demoPassword = "DemoUser123!";

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const demoHash = await bcrypt.hash(demoPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash: adminHash, plan: "PRO" },
    create: {
      email: adminEmail,
      name: "BetEdge Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      plan: "PRO",
    },
  });

  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: { plan: "PRO", status: "ACTIVE" },
    create: {
      userId: admin.id,
      plan: "PRO",
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 864e5),
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { passwordHash: demoHash, plan: "FREE" },
    create: {
      email: demoEmail,
      name: "Demo Bettor",
      passwordHash: demoHash,
      role: "USER",
      plan: "FREE",
    },
  });

  await prisma.subscription.upsert({
    where: { userId: demo.id },
    update: { plan: "FREE", status: "INACTIVE" },
    create: { userId: demo.id, plan: "FREE", status: "INACTIVE" },
  });

  // Historical graded picks for performance tracker
  const today = utcDateOnly();
  await prisma.pick.deleteMany({ where: { modelVersion: "seed-v1" } });

  const historical: Array<{
    daysAgo: number;
    sport: Sport;
    eventName: string;
    market: string;
    pickSide: string;
    oddsAmerican: number;
    confidence: number;
    edgePercent: number;
    result: PickResult;
    isPremium?: boolean;
  }> = [
    {
      daysAgo: 1,
      sport: "NFL",
      eventName: "Eagles vs Cowboys",
      market: "spread",
      pickSide: "Eagles -3.5",
      oddsAmerican: -110,
      confidence: 71,
      edgePercent: 3.2,
      result: "WIN",
    },
    {
      daysAgo: 1,
      sport: "NBA",
      eventName: "Lakers vs Nuggets",
      market: "total",
      pickSide: "Under 224.5",
      oddsAmerican: -105,
      confidence: 66,
      edgePercent: 2.1,
      result: "LOSS",
    },
    {
      daysAgo: 2,
      sport: "MLB",
      eventName: "Braves vs Mets",
      market: "moneyline",
      pickSide: "Braves ML",
      oddsAmerican: -135,
      confidence: 68,
      edgePercent: 2.4,
      result: "WIN",
    },
    {
      daysAgo: 2,
      sport: "NHL",
      eventName: "Rangers vs Devils",
      market: "moneyline",
      pickSide: "Rangers ML",
      oddsAmerican: -120,
      confidence: 64,
      edgePercent: 1.8,
      result: "PUSH",
    },
    {
      daysAgo: 3,
      sport: "UFC",
      eventName: "Main Card Welterweight",
      market: "moneyline",
      pickSide: "Fighter X",
      oddsAmerican: +150,
      confidence: 74,
      edgePercent: 4.1,
      result: "WIN",
      isPremium: true,
    },
    {
      daysAgo: 3,
      sport: "SOCCER",
      eventName: "Man City vs Chelsea",
      market: "total",
      pickSide: "Over 2.5",
      oddsAmerican: -115,
      confidence: 70,
      edgePercent: 2.9,
      result: "WIN",
    },
    {
      daysAgo: 4,
      sport: "NBA",
      eventName: "Warriors vs Suns",
      market: "spread",
      pickSide: "Suns +4.5",
      oddsAmerican: -110,
      confidence: 67,
      edgePercent: 2.2,
      result: "LOSS",
    },
    {
      daysAgo: 5,
      sport: "NFL",
      eventName: "Ravens vs Steelers",
      market: "total",
      pickSide: "Under 42.5",
      oddsAmerican: -108,
      confidence: 73,
      edgePercent: 3.5,
      result: "WIN",
      isPremium: true,
    },
  ];

  for (const h of historical) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - h.daysAgo);
    const profit =
      h.result === "WIN" || h.result === "LOSS" || h.result === "PUSH" || h.result === "VOID"
        ? unitsFromOdds(
            h.oddsAmerican,
            h.result === "VOID" ? "VOID" : h.result === "PUSH" ? "PUSH" : h.result,
          )
        : null;

    await prisma.pick.create({
      data: {
        date: d,
        sport: h.sport,
        league: h.sport,
        eventName: h.eventName,
        market: h.market,
        pickSide: h.pickSide,
        oddsAmerican: h.oddsAmerican,
        confidence: h.confidence,
        edgePercent: h.edgePercent,
        unitsSuggested: 1,
        reasoning: `Seeded historical pick for demo performance tracking on ${h.eventName}.`,
        keyFactors: ["seed data", "demo tracker"],
        result: h.result,
        profitUnits: profit,
        isPremium: h.isPremium ?? false,
        modelVersion: "seed-v1",
        bookmaker: "seed",
      },
    });
  }

  // Today's open picks (demo)
  const todayGames: Array<{
    sport: Sport;
    eventName: string;
    market: string;
    pickSide: string;
    odds: number;
    confidence: number;
    edge: number;
    premium?: boolean;
  }> = [
    {
      sport: "NFL",
      eventName: "Chiefs vs Bills",
      market: "spread",
      pickSide: "Chiefs -2.5",
      odds: -110,
      confidence: 72,
      edge: 3.1,
      premium: true,
    },
    {
      sport: "NBA",
      eventName: "Celtics vs Bucks",
      market: "moneyline",
      pickSide: "Celtics ML",
      odds: -145,
      confidence: 69,
      edge: 2.4,
    },
    {
      sport: "MLB",
      eventName: "Dodgers vs Yankees",
      market: "total",
      pickSide: "Over 8.5",
      odds: -110,
      confidence: 65,
      edge: 1.9,
    },
    {
      sport: "UFC",
      eventName: "Lightweight Main Event",
      market: "moneyline",
      pickSide: "Fighter A",
      odds: -160,
      confidence: 70,
      edge: 2.8,
    },
    {
      sport: "SOCCER",
      eventName: "Arsenal vs Liverpool",
      market: "total",
      pickSide: "Over 2.5",
      odds: -110,
      confidence: 67,
      edge: 2.2,
    },
  ];

  for (const g of todayGames) {
    await prisma.pick.create({
      data: {
        date: today,
        sport: g.sport,
        league: g.sport,
        eventName: g.eventName,
        market: g.market,
        pickSide: g.pickSide,
        oddsAmerican: g.odds,
        confidence: g.confidence,
        edgePercent: g.edge,
        unitsSuggested: g.premium ? 1.5 : 1,
        reasoning: `Demo slate pick: ${g.pickSide} on ${g.eventName}. AI synthesis of market, form, and situational edges. For entertainment only.`,
        keyFactors: ["form", "market price", "situational edge"],
        isPremium: g.premium ?? false,
        modelVersion: "seed-v1",
        bookmaker: "seed",
        result: "PENDING",
      },
    });
  }

  const graded = await prisma.pick.findMany({
    where: { result: { in: ["WIN", "LOSS", "PUSH"] } },
  });
  const wins = graded.filter((g) => g.result === "WIN").length;
  const losses = graded.filter((g) => g.result === "LOSS").length;
  const pushes = graded.filter((g) => g.result === "PUSH").length;
  const decided = wins + losses;
  const unitsProfit = graded.reduce((s, g) => s + (g.profitUnits ?? 0), 0);
  const unitsRisked = graded
    .filter((g) => g.result === "WIN" || g.result === "LOSS")
    .reduce((s, g) => s + g.unitsSuggested, 0);

  await prisma.performanceSnapshot.upsert({
    where: { period_sportKey: { period: "all_time", sportKey: "ALL" } },
    create: {
      period: "all_time",
      sportKey: "ALL",
      totalPicks: graded.length,
      wins,
      losses,
      pushes,
      winRate: decided ? (wins / decided) * 100 : 0,
      unitsProfit,
      roiPercent: unitsRisked ? (unitsProfit / unitsRisked) * 100 : 0,
    },
    update: {
      totalPicks: graded.length,
      wins,
      losses,
      pushes,
      winRate: decided ? (wins / decided) * 100 : 0,
      unitsProfit,
      roiPercent: unitsRisked ? (unitsProfit / unitsRisked) * 100 : 0,
    },
  });

  console.log("Seed complete");
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`  Demo:  ${demoEmail} / ${demoPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
