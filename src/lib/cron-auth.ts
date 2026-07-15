import { NextResponse } from "next/server";

/**
 * Shared cron auth for Vercel Cron + Netlify scheduled jobs.
 * Requires Authorization: Bearer <CRON_SECRET> (or x-cron-secret header).
 * Fails closed in production when CRON_SECRET is missing.
 */
export function assertCronAuthorized(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = req.headers.get("authorization");
    const headerSecret = req.headers.get("x-cron-secret");
    if (auth === `Bearer ${secret}` || headerSecret === secret) {
      return null;
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "CRON_SECRET required in production" },
      { status: 401 },
    );
  }

  return null;
}
