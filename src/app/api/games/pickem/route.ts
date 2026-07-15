import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FALLBACK_PICKEM, type PickemMatch } from "@/lib/games/catalog";

export const dynamic = "force-dynamic";

/**
 * Free-play pick'em slate from upcoming SportsEvent rows, else curated fallback.
 */
export async function GET() {
  try {
    const now = new Date();
    const events = await prisma.sportsEvent.findMany({
      where: {
        OR: [
          { commenceTime: { gte: now } },
          { commenceTime: null },
        ],
      },
      orderBy: [{ commenceTime: "asc" }, { lastSeenAt: "desc" }],
      take: 12,
      select: {
        id: true,
        sport: true,
        league: true,
        homeTeam: true,
        awayTeam: true,
        eventName: true,
      },
    });

    let matches: PickemMatch[] = events
      .filter((e) => e.homeTeam && e.awayTeam)
      .map((e, i) => ({
        id: e.id,
        sport: e.sport,
        league: e.league ?? e.sport,
        home: e.homeTeam,
        away: e.awayTeam,
        seed: hashSeed(e.id) + i,
      }));

    if (matches.length < 4) {
      matches = FALLBACK_PICKEM;
    } else {
      matches = matches.slice(0, 8);
    }

    return NextResponse.json({
      ok: true,
      source: matches[0]?.id.startsWith("fb-") ? "fallback" : "live",
      matches,
    });
  } catch (err) {
    console.error("[games/pickem]", err);
    return NextResponse.json({
      ok: true,
      source: "fallback",
      matches: FALLBACK_PICKEM,
    });
  }
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
