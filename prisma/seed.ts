import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  await prisma.promoCode.upsert({
    where: { code: "BETEDGE-PRO-OWNER" },
    update: {
      plan: "PRO",
      active: true,
      description: "Founder / owner Pro access",
      maxRedemptions: null,
    },
    create: {
      code: "BETEDGE-PRO-OWNER",
      plan: "PRO",
      active: true,
      description: "Founder / owner Pro access",
      maxRedemptions: null,
    },
  });

  // Remove legacy seed / mock picks (no fabricated data)
  const deleted = await prisma.pick.deleteMany({
    where: {
      OR: [
        { modelVersion: "seed-v1" },
        { modelVersion: "mock-heuristic-v1" },
        { bookmaker: "seed" },
        { bookmaker: { startsWith: "mock_" } },
        { reasoning: { contains: "simulated analysis for development" } },
        { reasoning: { contains: "Demo slate pick" } },
        { reasoning: { contains: "Seeded historical pick" } },
      ],
    },
  });
  console.log(`  Cleared ${deleted.count} legacy seed/mock picks`);

  // Performance snapshot from remaining real graded picks only
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

  console.log("Seed complete (users + promo only — no mock picks)");
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
