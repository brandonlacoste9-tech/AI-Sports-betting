import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const r = await p.promoCode.upsert({
    where: { code: "BETEDGE-PRO-OWNER" },
    update: { plan: "PRO", active: true, description: "Founder Pro" },
    create: {
      code: "BETEDGE-PRO-OWNER",
      plan: "PRO",
      active: true,
      description: "Founder Pro",
      maxRedemptions: null,
    },
  });
  console.log("promo ok", r.code, r.plan, r.active);
}
main().finally(() => p.$disconnect());
