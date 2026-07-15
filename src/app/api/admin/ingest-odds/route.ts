import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ingestOddsSnapshots } from "@/lib/odds/ingest";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = rateLimit(`admin-ingest:${session.user.id}`, 6, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  try {
    const result = await ingestOddsSnapshots();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[admin ingest-odds]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ingest failed" },
      { status: 500 },
    );
  }
}
