import { createHash, randomBytes } from "crypto";
import type { Plan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/subscriptions";

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

/** Generate a displayable key once: be_live_<32 hex> */
export function generateRawApiKey(): { raw: string; prefix: string; hash: string } {
  const secret = randomBytes(24).toString("hex");
  const raw = `be_live_${secret}`;
  const prefix = raw.slice(0, 16);
  return { raw, prefix, hash: hashApiKey(raw) };
}

export async function createApiKeyForUser(userId: string, name: string, plan: Plan) {
  const limits = PLAN_LIMITS[plan];
  const activeCount = await prisma.apiKey.count({
    where: { userId, revokedAt: null },
  });
  if (activeCount >= limits.maxApiKeys) {
    return {
      ok: false as const,
      error: `Plan allows max ${limits.maxApiKeys} API key(s). Upgrade or revoke one.`,
    };
  }

  const { raw, prefix, hash } = generateRawApiKey();
  const key = await prisma.apiKey.create({
    data: {
      userId,
      name: name.slice(0, 60) || "Default",
      keyPrefix: prefix,
      keyHash: hash,
      planTier: plan,
    },
  });

  return {
    ok: true as const,
    // raw only returned once at creation
    rawKey: raw,
    key: {
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      planTier: key.planTier,
      createdAt: key.createdAt,
    },
  };
}

export async function authenticateApiKey(rawKey: string) {
  if (!rawKey.startsWith("be_live_")) return null;
  const keyHash = hashApiKey(rawKey);
  const key = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: { select: { id: true, plan: true, role: true } } },
  });
  if (!key || key.revokedAt) return null;

  // Reset daily counter if day rolled
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  if (key.lastResetAt < startOfDay) {
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { requestsDay: 0, lastResetAt: new Date() },
    });
    key.requestsDay = 0;
  }

  const plan = key.user.plan;
  const dailyLimit = PLAN_LIMITS[plan].apiRequestsPerDay;
  if (key.requestsDay >= dailyLimit) {
    return { key, user: key.user, allowed: false as const, dailyLimit };
  }

  return { key, user: key.user, allowed: true as const, dailyLimit };
}

export async function recordApiUsage(
  apiKeyId: string,
  path: string,
  status: number,
) {
  await prisma.$transaction([
    prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        requestsDay: { increment: 1 },
        requestsAll: { increment: 1 },
        lastUsedAt: new Date(),
      },
    }),
    prisma.apiKeyUsage.create({
      data: { apiKeyId, path, status },
    }),
  ]);
}
