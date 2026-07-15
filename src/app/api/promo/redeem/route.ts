import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { redeemPromoForUser } from "@/lib/promo";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  code: z.string().min(4).max(64),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`promo:${session.user.id}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
  }

  const result = await redeemPromoForUser(session.user.id, parsed.data.code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    plan: result.plan,
    code: result.code,
    message: `Upgraded to ${result.plan}. Refresh or re-login if the badge is slow to update.`,
  });
}
