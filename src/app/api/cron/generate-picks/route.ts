import { NextResponse } from "next/server";
import { generateAndStorePicks } from "@/lib/ai/generate-picks";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { sendDailyPickDigests } from "@/lib/email/digest";

/**
 * Cron: generate AI picks from live odds, then attempt digest email.
 */
export async function GET(req: Request) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;

  try {
    const result = await generateAndStorePicks({ regenerate: true });
    let digest: Awaited<ReturnType<typeof sendDailyPickDigests>> | null = null;
    try {
      digest = await sendDailyPickDigests();
    } catch (err) {
      console.error("[cron generate-picks] digest after generate failed", err);
    }
    return NextResponse.json({ ok: true, ...result, digest });
  } catch (err) {
    console.error("[cron generate-picks]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
