import { prisma } from "@/lib/db";
import { fetchOddsEvents } from "@/lib/odds/client";
import type { Sport } from "@prisma/client";

export type IngestResult = {
  source: "mock" | "the-odds-api";
  eventsUpserted: number;
  marketsWritten: number;
  snapshotsWritten: number;
};

function pointKey(point: number | null | undefined): string {
  if (point === null || point === undefined) return "";
  return String(point);
}

/**
 * Snapshot current odds into SportsEvent / Market / OddsSnapshot.
 */
export async function ingestOddsSnapshots(sports?: Sport[]): Promise<IngestResult> {
  const { events, source } = await fetchOddsEvents(sports);
  let eventsUpserted = 0;
  let marketsWritten = 0;
  let snapshotsWritten = 0;
  const now = new Date();

  for (const ev of events) {
    const event = await prisma.sportsEvent.upsert({
      where: { externalId: ev.id },
      create: {
        externalId: ev.id,
        sport: ev.sport,
        league: ev.league,
        homeTeam: ev.homeTeam,
        awayTeam: ev.awayTeam,
        eventName: ev.eventName,
        commenceTime: ev.commenceTime ? new Date(ev.commenceTime) : null,
        lastSeenAt: now,
      },
      update: {
        league: ev.league,
        homeTeam: ev.homeTeam,
        awayTeam: ev.awayTeam,
        eventName: ev.eventName,
        commenceTime: ev.commenceTime ? new Date(ev.commenceTime) : null,
        lastSeenAt: now,
      },
    });
    eventsUpserted += 1;

    for (const market of ev.markets) {
      for (const outcome of market.outcomes) {
        const point = outcome.point ?? null;
        const pKey = pointKey(point);
        const selection = outcome.name;
        const bookmaker = ev.bookmaker;
        const oddsAmerican = Math.round(outcome.price);

        const existing = await prisma.market.findUnique({
          where: {
            eventId_marketKey_selection_pointKey_bookmaker: {
              eventId: event.id,
              marketKey: market.key,
              selection,
              pointKey: pKey,
              bookmaker,
            },
          },
        });

        if (existing) {
          const changed =
            existing.oddsAmerican !== oddsAmerican || existing.point !== point;

          await prisma.market.update({
            where: { id: existing.id },
            data: {
              oddsAmerican,
              point,
              capturedAt: now,
              ...(changed
                ? {
                    snapshots: {
                      create: {
                        oddsAmerican,
                        point,
                        capturedAt: now,
                      },
                    },
                  }
                : {}),
            },
          });

          if (changed) {
            marketsWritten += 1;
            snapshotsWritten += 1;
          }
        } else {
          await prisma.market.create({
            data: {
              eventId: event.id,
              marketKey: market.key,
              selection,
              pointKey: pKey,
              point,
              bookmaker,
              oddsAmerican,
              capturedAt: now,
              snapshots: {
                create: {
                  oddsAmerican,
                  point,
                  capturedAt: now,
                },
              },
            },
          });
          marketsWritten += 1;
          snapshotsWritten += 1;
        }
      }
    }
  }

  return { source, eventsUpserted, marketsWritten, snapshotsWritten };
}

export type LineMove = {
  eventId: string;
  eventName: string;
  sport: Sport;
  league: string | null;
  commenceTime: Date | null;
  marketKey: string;
  selection: string;
  point: number | null;
  bookmaker: string;
  previousOdds: number;
  currentOdds: number;
  previousPoint: number | null;
  currentPoint: number | null;
  delta: number;
  capturedAt: Date;
};

/**
 * Line moves from snapshot history (need at least 2 snapshots per market).
 */
export async function getLineMoves(options?: {
  sport?: Sport;
  limit?: number;
  hours?: number;
}): Promise<LineMove[]> {
  const limit = options?.limit ?? 40;
  const hours = options?.hours ?? 72;
  const since = new Date(Date.now() - hours * 3600_000);

  const markets = await prisma.market.findMany({
    where: {
      capturedAt: { gte: since },
      ...(options?.sport ? { event: { sport: options.sport } } : {}),
      snapshots: { some: {} },
    },
    include: {
      event: true,
      snapshots: {
        orderBy: { capturedAt: "desc" },
        take: 2,
      },
    },
    orderBy: { capturedAt: "desc" },
    take: 300,
  });

  const moves: LineMove[] = [];

  for (const row of markets) {
    if (row.snapshots.length < 2) continue;
    const [current, previous] = row.snapshots;
    if (current.oddsAmerican === previous.oddsAmerican && current.point === previous.point) {
      continue;
    }

    moves.push({
      eventId: row.eventId,
      eventName: row.event.eventName,
      sport: row.event.sport,
      league: row.event.league,
      commenceTime: row.event.commenceTime,
      marketKey: row.marketKey,
      selection: row.selection,
      point: row.point,
      bookmaker: row.bookmaker,
      previousOdds: previous.oddsAmerican,
      currentOdds: current.oddsAmerican,
      previousPoint: previous.point,
      currentPoint: current.point,
      delta: current.oddsAmerican - previous.oddsAmerican,
      capturedAt: current.capturedAt,
    });
  }

  moves.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return moves.slice(0, limit);
}

export async function getLatestBoard(options?: {
  sport?: Sport;
  limit?: number;
}) {
  const limit = options?.limit ?? 60;

  return prisma.sportsEvent.findMany({
    where: {
      ...(options?.sport ? { sport: options.sport } : {}),
      lastSeenAt: { gte: new Date(Date.now() - 7 * 864e5) },
    },
    include: {
      markets: {
        orderBy: [{ marketKey: "asc" }, { selection: "asc" }],
        take: 12,
      },
    },
    orderBy: [{ commenceTime: "asc" }, { lastSeenAt: "desc" }],
    take: limit,
  });
}
