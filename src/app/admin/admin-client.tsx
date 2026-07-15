"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
  subscription: { status: string } | null;
};

type PickRow = {
  id: string;
  sport: string;
  eventName: string;
  pickSide: string;
  confidence: number;
  isPremium: boolean;
  date: string;
  modelVersion: string | null;
  result: string;
  oddsAmerican: number;
  profitUnits: number | null;
};

type GradeResult = "WIN" | "LOSS" | "PUSH" | "VOID" | "PENDING";

export function AdminClient({
  stats,
  users,
  recentPicks,
  pendingPicks,
}: {
  stats: {
    users: number;
    basic: number;
    pro: number;
    estimatedMrr: number;
    performance: { winRate: number; unitsProfit: number; totalPicks: number } | null;
  };
  users: UserRow[];
  recentPicks: PickRow[];
  pendingPicks: PickRow[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"picks" | "odds" | "digest" | string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  async function generatePicks() {
    setLoading("picks");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/generate-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate: true }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        created?: number;
        model?: string;
        source?: string;
        error?: string;
      };
      if (!res.ok) {
        setMessage(data.error ?? "Generation failed");
        return;
      }
      setMessage(
        `Generated ${data.created} picks via ${data.model} (odds: ${data.source})`,
      );
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function ingestOdds() {
    setLoading("odds");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ingest-odds", { method: "POST" });
      const data = (await res.json()) as {
        ok?: boolean;
        source?: string;
        eventsUpserted?: number;
        marketsWritten?: number;
        snapshotsWritten?: number;
        error?: string;
      };
      if (!res.ok) {
        setMessage(data.error ?? "Ingest failed");
        return;
      }
      setMessage(
        `Odds ingest (${data.source}): ${data.eventsUpserted} events, ${data.marketsWritten} market updates, ${data.snapshotsWritten} snapshots`,
      );
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function sendDigest() {
    setLoading("digest");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/send-digest", { method: "POST" });
      const data = (await res.json()) as {
        ok?: boolean;
        skipped?: boolean;
        reason?: string;
        sent?: number;
        failed?: number;
        recipients?: number;
        error?: string;
      };
      if (!res.ok) {
        setMessage(data.error ?? "Digest failed");
        return;
      }
      if (data.skipped) {
        setMessage(`Digest skipped: ${data.reason ?? "n/a"}`);
      } else {
        setMessage(
          `Digest sent ${data.sent}/${data.recipients} (failed ${data.failed})`,
        );
      }
    } finally {
      setLoading(null);
    }
  }

  async function gradePick(pickId: string, result: GradeResult) {
    setLoading(`grade:${pickId}:${result}`);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/grade-pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickId, result }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        pick?: { eventName: string; result: string; profitUnits: number | null };
        error?: string;
      };
      if (!res.ok) {
        setMessage(data.error ?? "Grade failed");
        return;
      }
      const units =
        data.pick?.profitUnits == null
          ? ""
          : ` (${data.pick.profitUnits >= 0 ? "+" : ""}${data.pick.profitUnits.toFixed(2)}u)`;
      setMessage(`Graded ${data.pick?.eventName}: ${data.pick?.result}${units}`);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Users" value={`${stats.users}`} />
        <Metric title="Basic / Pro" value={`${stats.basic} / ${stats.pro}`} />
        <Metric title="Est. MRR" value={`$${stats.estimatedMrr}`} accent />
        <Metric
          title="Win rate"
          value={
            stats.performance ? `${stats.performance.winRate.toFixed(1)}%` : "—"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI pick engine</CardTitle>
          <CardDescription>
            Live odds APIs → Grok structured JSON → database. No mock data. Rate limited.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={generatePicks} disabled={loading !== null}>
            {loading === "picks" ? "Generating…" : "Generate picks"}
          </Button>
          <Button variant="secondary" onClick={ingestOdds} disabled={loading !== null}>
            {loading === "odds" ? "Ingesting…" : "Ingest odds snapshots"}
          </Button>
          <Button variant="secondary" onClick={sendDigest} disabled={loading !== null}>
            {loading === "digest" ? "Sending…" : "Send digests"}
          </Button>
          {message && <p className="w-full text-sm text-muted">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade pending picks</CardTitle>
          <CardDescription>
            Mark WIN / LOSS / PUSH / VOID after games settle. Updates public /record.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingPicks.length === 0 ? (
            <p className="text-sm text-muted">No pending picks.</p>
          ) : (
            pendingPicks.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-lg border border-card-border bg-background/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="muted">{p.sport}</Badge>
                    <span className="text-xs text-muted">
                      {p.date.slice(0, 10)}
                      {p.isPremium ? " · PRO" : ""}
                    </span>
                  </div>
                  <div className="mt-1 font-medium">{p.eventName}</div>
                  <div className="text-accent">
                    {p.pickSide} · conf {p.confidence.toFixed(0)}%
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["WIN", "LOSS", "PUSH", "VOID"] as const).map((r) => (
                    <Button
                      key={r}
                      size="sm"
                      variant={r === "WIN" ? "default" : "secondary"}
                      disabled={loading !== null}
                      onClick={() => gradePick(p.id, r)}
                    >
                      {loading === `grade:${p.id}:${r}` ? "…" : r}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-muted">
              <tr className="border-b border-card-border">
                <th className="pb-2 pr-3 font-medium">Email</th>
                <th className="pb-2 pr-3 font-medium">Plan</th>
                <th className="pb-2 pr-3 font-medium">Role</th>
                <th className="pb-2 pr-3 font-medium">Billing</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-card-border/60">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{u.email}</div>
                    <div className="text-xs text-muted">{u.name}</div>
                  </td>
                  <td className="py-2 pr-3">
                    <Badge variant="accent">{u.plan}</Badge>
                  </td>
                  <td className="py-2 pr-3">{u.role}</td>
                  <td className="py-2 pr-3">{u.subscription?.status ?? "—"}</td>
                  <td className="py-2 text-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent picks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentPicks.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-card-border bg-background/40 px-3 py-2 text-sm"
            >
              <div>
                <Badge variant="muted" className="mr-2">
                  {p.sport}
                </Badge>
                {p.eventName} · <span className="text-accent">{p.pickSide}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <ResultChip result={p.result} />
                {p.confidence.toFixed(0)}% · {p.modelVersion}
                {p.isPremium ? " · PRO" : ""}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultChip({ result }: { result: string }) {
  if (result === "WIN") return <Badge variant="accent">WIN</Badge>;
  if (result === "LOSS") return <Badge variant="danger">LOSS</Badge>;
  if (result === "PUSH") return <Badge variant="warning">PUSH</Badge>;
  if (result === "VOID") return <Badge variant="muted">VOID</Badge>;
  return <Badge variant="muted">PENDING</Badge>;
}

function Metric({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs text-muted">{title}</div>
        <div className={`mt-1 text-2xl font-bold ${accent ? "text-accent" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
