import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPicksForUser, recordPickView } from "@/lib/picks-access";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`picks:${session.user.id}`, 60, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const data = await getPicksForUser(session.user.id, session.user.plan);
  return NextResponse.json(data);
}

const unlockSchema = z.object({
  pickId: z.string().min(1),
});

/** Free tier: unlock/view a pick for today. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = unlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = await recordPickView(
    session.user.id,
    parsed.data.pickId,
    session.user.plan,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
