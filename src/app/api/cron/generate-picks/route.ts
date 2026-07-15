import { NextResponse } from "next/server";
import { generateAndStorePicks } from "@/lib/ai/generate-picks";

/**
 * Cron-ready endpoint for Vercel Cron.
 * Secure with CRON_SECRET header when deployed.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "CRON_SECRET required in production" },
      { status: 401 },
    );
  }

  try {
    const result = await generateAndStorePicks({ regenerate: true });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron generate-picks]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
