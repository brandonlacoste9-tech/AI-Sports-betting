import { prisma } from "@/lib/db";
import { formatAmericanOdds, utcDateOnly } from "@/lib/utils";
import { emailFrom, getResend, hasEmailConfigured } from "@/lib/email/resend";

export type DigestResult = {
  skipped: boolean;
  reason?: string;
  sent: number;
  failed: number;
  recipients: number;
};

type DigestPick = {
  sport: string;
  eventName: string;
  pickSide: string;
  oddsAmerican: number;
  confidence: number;
  edgePercent: number;
  isPremium: boolean;
  result: string;
};

/**
 * Email today's slate (+ optional graded recap) to Basic/Pro subscribers.
 * No-ops cleanly when RESEND_API_KEY is missing.
 */
export async function sendDailyPickDigests(options?: {
  /** Override slate date (UTC midnight). */
  date?: Date;
  /** Max recipients per run (safety). */
  limit?: number;
}): Promise<DigestResult> {
  if (!hasEmailConfigured()) {
    return {
      skipped: true,
      reason: "RESEND_API_KEY not set",
      sent: 0,
      failed: 0,
      recipients: 0,
    };
  }

  const resend = getResend();
  if (!resend) {
    return {
      skipped: true,
      reason: "Resend client unavailable",
      sent: 0,
      failed: 0,
      recipients: 0,
    };
  }

  const date = options?.date ?? utcDateOnly();
  const limit = options?.limit ?? 500;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://www.betedge-ai.com";
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "BetEdge AI";

  const [picks, users, performance] = await Promise.all([
    prisma.pick.findMany({
      where: { date },
      orderBy: [{ isPremium: "asc" }, { confidence: "desc" }],
      select: {
        sport: true,
        eventName: true,
        pickSide: true,
        oddsAmerican: true,
        confidence: true,
        edgePercent: true,
        isPremium: true,
        result: true,
      },
    }),
    prisma.user.findMany({
      where: {
        plan: { in: ["BASIC", "PRO"] },
        email: { not: "" },
      },
      take: limit,
      select: { email: true, name: true, plan: true },
    }),
    prisma.performanceSnapshot.findUnique({
      where: { period_sportKey: { period: "all_time", sportKey: "ALL" } },
    }),
  ]);

  if (users.length === 0) {
    return {
      skipped: true,
      reason: "No Basic/Pro subscribers",
      sent: 0,
      failed: 0,
      recipients: 0,
    };
  }

  if (picks.length === 0) {
    return {
      skipped: true,
      reason: "No picks for slate date",
      sent: 0,
      failed: 0,
      recipients: users.length,
    };
  }

  const subjectDate = date.toISOString().slice(0, 10);
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const visible = picks.filter((p) =>
      user.plan === "PRO" ? true : !p.isPremium,
    );
    if (visible.length === 0) continue;

    const html = buildDigestHtml({
      appName,
      appUrl,
      name: user.name,
      plan: user.plan,
      picks: visible,
      performance: performance
        ? {
            winRate: performance.winRate,
            unitsProfit: performance.unitsProfit,
            totalPicks: performance.totalPicks,
          }
        : null,
      subjectDate,
    });

    try {
      const { error } = await resend.emails.send({
        from: emailFrom(),
        to: user.email,
        subject: `${appName}: ${visible.length} pick${visible.length === 1 ? "" : "s"} for ${subjectDate}`,
        html,
      });
      if (error) {
        console.error("[digest] send error", user.email, error);
        failed += 1;
      } else {
        sent += 1;
      }
    } catch (err) {
      console.error("[digest] send failed", user.email, err);
      failed += 1;
    }
  }

  return { skipped: false, sent, failed, recipients: users.length };
}

function buildDigestHtml(opts: {
  appName: string;
  appUrl: string;
  name: string | null;
  plan: string;
  picks: DigestPick[];
  performance: { winRate: number; unitsProfit: number; totalPicks: number } | null;
  subjectDate: string;
}): string {
  const greeting = opts.name ? `Hi ${escapeHtml(opts.name)},` : "Hi,";
  const rows = opts.picks
    .map((p) => {
      const odds = formatAmericanOdds(p.oddsAmerican);
      const tier = p.isPremium ? "PRO" : "CORE";
      return `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:12px;">${escapeHtml(p.sport)} · ${tier}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #1e293b;color:#e2e8f0;">
          <div style="font-weight:600;">${escapeHtml(p.eventName)}</div>
          <div style="color:#22d3ee;margin-top:2px;">${escapeHtml(p.pickSide)} @ ${odds}</div>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #1e293b;color:#e2e8f0;text-align:right;white-space:nowrap;">
          ${p.confidence.toFixed(0)}% · edge ${p.edgePercent.toFixed(1)}%
        </td>
      </tr>`;
    })
    .join("");

  const perf = opts.performance
    ? `<p style="color:#94a3b8;font-size:13px;">Track record: <strong style="color:#e2e8f0;">${opts.performance.winRate.toFixed(1)}%</strong> win rate · <strong style="color:#22d3ee;">${opts.performance.unitsProfit >= 0 ? "+" : ""}${opts.performance.unitsProfit.toFixed(2)}u</strong> on ${opts.performance.totalPicks} graded · <a href="${opts.appUrl}/record" style="color:#22d3ee;">Public record</a></p>`
    : "";

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0b1220;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
    <div style="font-size:20px;font-weight:700;color:#f8fafc;margin-bottom:4px;">
      ${escapeHtml(opts.appName)}
    </div>
    <div style="color:#64748b;font-size:13px;margin-bottom:24px;">Daily picks · ${escapeHtml(opts.subjectDate)} · ${escapeHtml(opts.plan)}</div>
    <p style="color:#e2e8f0;font-size:15px;">${greeting}</p>
    <p style="color:#94a3b8;font-size:14px;line-height:1.5;">
      Here is your ${escapeHtml(opts.plan)} slate for today. Full reasoning is in the dashboard.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#111827;border-radius:12px;overflow:hidden;">
      <thead>
        <tr style="background:#0f172a;">
          <th style="text-align:left;padding:10px 8px;color:#64748b;font-size:11px;text-transform:uppercase;">Sport</th>
          <th style="text-align:left;padding:10px 8px;color:#64748b;font-size:11px;text-transform:uppercase;">Pick</th>
          <th style="text-align:right;padding:10px 8px;color:#64748b;font-size:11px;text-transform:uppercase;">Conf</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${perf}
    <p style="margin-top:28px;">
      <a href="${opts.appUrl}/dashboard" style="display:inline-block;background:#22d3ee;color:#0b1220;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">
        Open dashboard
      </a>
    </p>
    <p style="color:#475569;font-size:11px;margin-top:32px;line-height:1.5;">
      Educational / entertainment only. Not a sportsbook. Bet responsibly.
      You receive this because you have an active ${escapeHtml(opts.plan)} plan on ${escapeHtml(opts.appName)}.
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
