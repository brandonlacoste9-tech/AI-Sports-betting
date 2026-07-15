import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateAndStorePicks } from "@/lib/ai/generate-picks";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = rateLimit(`admin-gen:${session.user.id}`, 5, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit: max 5 generations per minute" },
      { status: 429 },
    );
  }

  let regenerate = true;
  try {
    const body = (await req.json()) as { regenerate?: boolean };
    if (typeof body.regenerate === "boolean") regenerate = body.regenerate;
  } catch {
    // empty body ok
  }

  try {
    const result = await generateAndStorePicks({ regenerate });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[generate-picks]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 },
    );
  }
}
