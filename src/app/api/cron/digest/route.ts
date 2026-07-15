import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { sendDailyPickDigests } from "@/lib/email/digest";

/**
 * Cron: email daily pick digests to Basic/Pro subscribers (Resend).
 */
export async function GET(req: Request) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;

  try {
    const result = await sendDailyPickDigests();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron digest]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Digest failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
