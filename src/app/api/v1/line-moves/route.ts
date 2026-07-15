import { NextResponse } from "next/server";
import { z } from "zod";
import { Sport } from "@prisma/client";
import { authenticateApiKey, recordApiUsage } from "@/lib/api-keys";
import { getLineMoves } from "@/lib/odds/ingest";
import { formatAmericanOdds } from "@/lib/utils";

const querySchema = z.object({
  sport: z.nativeEnum(Sport).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  hours: z.coerce.number().int().min(1).max(168).optional(),
});

/**
 * Developer API: GET /api/v1/line-moves
 * Auth: Authorization: Bearer be_live_...
 * Requires BASIC or PRO plan on the key owner.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const rawKey = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : req.headers.get("x-api-key")?.trim() ?? "";

  if (!rawKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const authResult = await authenticateApiKey(rawKey);
  if (!authResult) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  if (authResult.user.plan === "FREE") {
    await recordApiUsage(authResult.key.id, "/api/v1/line-moves", 403);
    return NextResponse.json(
      { error: "Line moves API requires Basic or Pro plan" },
      { status: 403 },
    );
  }

  if (!authResult.allowed) {
    await recordApiUsage(authResult.key.id, "/api/v1/line-moves", 429);
    return NextResponse.json({ error: "Daily API quota exceeded" }, { status: 429 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    sport: url.searchParams.get("sport") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    hours: url.searchParams.get("hours") ?? undefined,
  });

  if (!parsed.success) {
    await recordApiUsage(authResult.key.id, "/api/v1/line-moves", 400);
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const moves = await getLineMoves({
    sport: parsed.data.sport,
    limit: parsed.data.limit ?? 40,
    hours: parsed.data.hours ?? 72,
  });

  await recordApiUsage(authResult.key.id, "/api/v1/line-moves", 200);

  return NextResponse.json({
    data: moves.map((m) => ({
      ...m,
      previousOddsDisplay: formatAmericanOdds(m.previousOdds),
      currentOddsDisplay: formatAmericanOdds(m.currentOdds),
    })),
    meta: { count: moves.length, plan: authResult.user.plan },
  });
}
