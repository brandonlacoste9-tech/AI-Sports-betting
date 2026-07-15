import { NextResponse } from "next/server";
import { z } from "zod";
import { Sport } from "@prisma/client";
import { authenticateApiKey, recordApiUsage } from "@/lib/api-keys";
import { getLatestBoard } from "@/lib/odds/ingest";
import { formatAmericanOdds } from "@/lib/utils";

const querySchema = z.object({
  sport: z.nativeEnum(Sport).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/**
 * Developer API: GET /api/v1/odds
 * Auth: Authorization: Bearer be_live_...
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const rawKey = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : req.headers.get("x-api-key")?.trim() ?? "";

  if (!rawKey) {
    return NextResponse.json(
      { error: "Missing API key. Use Authorization: Bearer be_live_..." },
      { status: 401 },
    );
  }

  const authResult = await authenticateApiKey(rawKey);
  if (!authResult) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  if (!authResult.allowed) {
    await recordApiUsage(authResult.key.id, "/api/v1/odds", 429);
    return NextResponse.json(
      {
        error: "Daily API quota exceeded",
        limit: authResult.dailyLimit,
        plan: authResult.user.plan,
      },
      { status: 429 },
    );
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    sport: url.searchParams.get("sport") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    await recordApiUsage(authResult.key.id, "/api/v1/odds", 400);
    return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
  }

  const board = await getLatestBoard({
    sport: parsed.data.sport,
    limit: parsed.data.limit ?? 40,
  });

  await recordApiUsage(authResult.key.id, "/api/v1/odds", 200);

  return NextResponse.json({
    data: board.map((e) => ({
      id: e.id,
      sport: e.sport,
      league: e.league,
      eventName: e.eventName,
      homeTeam: e.homeTeam,
      awayTeam: e.awayTeam,
      commenceTime: e.commenceTime,
      markets: e.markets.map((m) => ({
        key: m.marketKey,
        selection: m.selection,
        point: m.point,
        bookmaker: m.bookmaker,
        oddsAmerican: m.oddsAmerican,
        oddsDisplay: formatAmericanOdds(m.oddsAmerican),
        capturedAt: m.capturedAt,
      })),
    })),
    meta: {
      count: board.length,
      plan: authResult.user.plan,
      dailyLimit: authResult.dailyLimit,
      requestsToday: authResult.key.requestsDay + 1,
    },
  });
}
