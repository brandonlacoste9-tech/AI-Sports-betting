import { prisma } from "../src/lib/db.ts";

async function main() {
  const picks = await prisma.pick.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      sport: true,
      pickSide: true,
      confidence: true,
      edgePercent: true,
      modelVersion: true,
      reasoning: true,
      isPremium: true,
      keyFactors: true,
    },
  });
  for (const x of picks) {
    console.log("---");
    console.log(
      x.sport,
      "|",
      x.pickSide,
      "| conf",
      x.confidence,
      "| edge",
      x.edgePercent,
      "| prem",
      x.isPremium,
      "| model",
      x.modelVersion,
    );
    console.log(x.reasoning.slice(0, 320));
    console.log("factors:", x.keyFactors.join(" | "));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
