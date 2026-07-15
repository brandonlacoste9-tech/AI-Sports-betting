import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendDailyPickDigests } from "@/lib/email/digest";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = rateLimit(`admin-digest:${session.user.id}`, 3, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit: max 3 digests per minute" },
      { status: 429 },
    );
  }

  try {
    const result = await sendDailyPickDigests();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[admin send-digest]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Digest failed" },
      { status: 500 },
    );
  }
}
