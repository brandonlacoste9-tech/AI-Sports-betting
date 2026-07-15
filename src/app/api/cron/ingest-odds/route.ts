import { NextResponse } from "next/server";
import { ingestOddsSnapshots } from "@/lib/odds/ingest";

/**
 * Cron: snapshot odds into Neon for line history + public board + developer API.
 * Secure with CRON_SECRET in production.
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
    const result = await ingestOddsSnapshots();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron ingest-odds]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ingest failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
