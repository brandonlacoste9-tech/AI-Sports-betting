import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshPerformanceSnapshot } from "@/lib/ai/generate-picks";
import { unitsFromOdds } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import type { PickResult } from "@prisma/client";

const ALLOWED: PickResult[] = ["WIN", "LOSS", "PUSH", "VOID", "PENDING"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = rateLimit(`admin-grade:${session.user.id}`, 60, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: { pickId?: string; result?: string };
  try {
    body = (await req.json()) as { pickId?: string; result?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pickId = body.pickId?.trim();
  const result = body.result?.toUpperCase() as PickResult | undefined;

  if (!pickId || !result || !ALLOWED.includes(result)) {
    return NextResponse.json(
      { error: "pickId and result (WIN|LOSS|PUSH|VOID|PENDING) required" },
      { status: 400 },
    );
  }

  const pick = await prisma.pick.findUnique({
    where: { id: pickId },
    select: {
      id: true,
      oddsAmerican: true,
      unitsSuggested: true,
      result: true,
    },
  });

  if (!pick) {
    return NextResponse.json({ error: "Pick not found" }, { status: 404 });
  }

  const profitUnits =
    result === "PENDING"
      ? null
      : unitsFromOdds(
          pick.oddsAmerican,
          result as "WIN" | "LOSS" | "PUSH" | "VOID",
        ) * pick.unitsSuggested;

  const updated = await prisma.pick.update({
    where: { id: pickId },
    data: { result, profitUnits },
    select: {
      id: true,
      eventName: true,
      pickSide: true,
      result: true,
      profitUnits: true,
    },
  });

  await refreshPerformanceSnapshot();

  return NextResponse.json({ ok: true, pick: updated });
}
