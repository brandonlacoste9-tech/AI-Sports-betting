import { z } from "zod";
import type { Prisma, Sport } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fetchOddsEvents } from "@/lib/odds/client";
import { PICK_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompts";
import { utcDateOnly } from "@/lib/utils";
import type { OddsEvent } from "@/lib/odds/mock-data";

const pickSchema = z.object({
  sport: z.enum(["NFL", "NBA", "MLB", "NHL", "UFC", "SOCCER"]),
  league: z.string().optional().nullable(),
  eventName: z.string().min(3),
  eventStartsAt: z.string().nullable().optional(),
  market: z.string().min(2),
  pickSide: z.string().min(1),
  oddsAmerican: z.number().int(),
  bookmaker: z.string().nullable().optional(),
  confidence: z.number().min(0).max(100),
  edgePercent: z.number(),
  unitsSuggested: z.number().min(0.1).max(5).default(1),
  reasoning: z.string().min(20),
  keyFactors: z.array(z.string()).default([]),
  isPremium: z.boolean().default(false),
});

const responseSchema = z.object({
  picks: z.array(pickSchema).min(1).max(20),
  analysisNotes: z.string().optional(),
});

export type GeneratedPick = z.infer<typeof pickSchema>;

function mockAiPicks(events: OddsEvent[]): GeneratedPick[] {
  // Heuristic mock “AI” so local dev works without XAI_API_KEY
  return events.slice(0, 6).map((event, i) => {
    const market = event.markets[0];
    const outcome = market?.outcomes[0];
    const point =
      outcome?.point !== undefined ? ` ${outcome.point > 0 ? "+" : ""}${outcome.point}` : "";
    const pickSide = outcome ? `${outcome.name}${point}` : event.homeTeam;
    const oddsAmerican = outcome?.price ?? -110;
    const confidence = 62 + (i % 5) * 4;
    const edgePercent = 1.5 + (i % 4) * 0.7;
    const isPremium = confidence >= 72 && edgePercent >= 3;

    return {
      sport: event.sport,
      league: event.league,
      eventName: event.eventName,
      eventStartsAt: event.commenceTime,
      market:
        market?.key === "h2h" ? "moneyline" : market?.key === "spreads" ? "spread" : "total",
      pickSide,
      oddsAmerican,
      bookmaker: event.bookmaker,
      confidence,
      edgePercent: Number(edgePercent.toFixed(2)),
      unitsSuggested: isPremium ? 1.5 : 1,
      reasoning: [
        `Model lean on ${pickSide} after weighing market price (${oddsAmerican}) against situational factors.`,
        event.context.lineMove ? `Line movement: ${event.context.lineMove}.` : "",
        event.context.injuries?.length
          ? `Injury context: ${event.context.injuries.join("; ")}.`
          : "",
        event.context.weather ? `Weather: ${event.context.weather}.` : "",
        event.context.notes?.length ? `Notes: ${event.context.notes.join(" ")}` : "",
        "This is a simulated analysis for development — not a guarantee of profit.",
      ]
        .filter(Boolean)
        .join(" "),
      keyFactors: [
        ...(event.context.injuries ?? []),
        ...(event.context.weather ? [event.context.weather] : []),
        ...(event.context.lineMove ? [event.context.lineMove] : []),
        ...(event.context.notes ?? []),
      ].slice(0, 6),
      isPremium,
    };
  });
}

async function callGrok(events: OddsEvent[], slateDate: string): Promise<GeneratedPick[]> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return mockAiPicks(events);
  }

  const model = process.env.XAI_MODEL ?? "grok-3";
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PICK_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(events, slateDate) },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[xai] error", res.status, text);
    // Graceful fallback
    return mockAiPicks(events);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return mockAiPicks(events);
  }

  const parsedJson: unknown = JSON.parse(content);
  const validated = responseSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error("[xai] schema validation failed", validated.error.flatten());
    return mockAiPicks(events);
  }

  return validated.data.picks;
}

export type GeneratePicksResult = {
  source: "mock" | "the-odds-api";
  model: string;
  created: number;
  picks: Array<{ id: string; eventName: string; sport: Sport }>;
};

/**
 * Fetch market data → AI (or mock) → persist picks for today's slate.
 * Replaces existing PENDING picks for the same UTC date when regenerate=true.
 */
export async function generateAndStorePicks(options?: {
  regenerate?: boolean;
}): Promise<GeneratePicksResult> {
  const regenerate = options?.regenerate ?? true;
  const slate = utcDateOnly();
  const slateIso = slate.toISOString().slice(0, 10);

  const { events, source } = await fetchOddsEvents();
  const generated = await callGrok(events, slateIso);
  const modelVersion = process.env.XAI_API_KEY
    ? (process.env.XAI_MODEL ?? "grok-2-latest")
    : "mock-heuristic-v1";

  if (regenerate) {
    await prisma.pick.deleteMany({
      where: {
        date: slate,
        result: "PENDING",
      },
    });
  }

  const created = await prisma.$transaction(
    generated.map((p) =>
      prisma.pick.create({
        data: {
          date: slate,
          sport: p.sport,
          league: p.league ?? p.sport,
          eventName: p.eventName,
          eventStartsAt: p.eventStartsAt ? new Date(p.eventStartsAt) : null,
          market: p.market,
          pickSide: p.pickSide,
          oddsAmerican: p.oddsAmerican,
          bookmaker: p.bookmaker ?? null,
          confidence: p.confidence,
          edgePercent: p.edgePercent,
          unitsSuggested: p.unitsSuggested,
          reasoning: p.reasoning,
          keyFactors: p.keyFactors,
          isPremium: p.isPremium,
          modelVersion,
          rawPayload: p as unknown as Prisma.InputJsonValue,
        },
        select: { id: true, eventName: true, sport: true },
      }),
    ),
  );

  // Refresh simple all-time snapshot from graded picks
  await refreshPerformanceSnapshot();

  return {
    source,
    model: modelVersion,
    created: created.length,
    picks: created,
  };
}

export async function refreshPerformanceSnapshot(): Promise<void> {
  const graded = await prisma.pick.findMany({
    where: { result: { in: ["WIN", "LOSS", "PUSH"] } },
    select: { result: true, profitUnits: true, unitsSuggested: true },
  });

  const wins = graded.filter((g) => g.result === "WIN").length;
  const losses = graded.filter((g) => g.result === "LOSS").length;
  const pushes = graded.filter((g) => g.result === "PUSH").length;
  const decided = wins + losses;
  const unitsProfit = graded.reduce((sum, g) => sum + (g.profitUnits ?? 0), 0);
  const unitsRisked = graded
    .filter((g) => g.result === "WIN" || g.result === "LOSS")
    .reduce((sum, g) => sum + g.unitsSuggested, 0);
  const winRate = decided > 0 ? (wins / decided) * 100 : 0;
  const roiPercent = unitsRisked > 0 ? (unitsProfit / unitsRisked) * 100 : 0;

  await prisma.performanceSnapshot.upsert({
    where: {
      period_sportKey: { period: "all_time", sportKey: "ALL" },
    },
    create: {
      period: "all_time",
      sportKey: "ALL",
      totalPicks: graded.length,
      wins,
      losses,
      pushes,
      winRate,
      unitsProfit,
      roiPercent,
    },
    update: {
      totalPicks: graded.length,
      wins,
      losses,
      pushes,
      winRate,
      unitsProfit,
      roiPercent,
    },
  });
}
