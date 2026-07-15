"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type KeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  planTier: string;
  requestsDay: number;
  requestsAll: number;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export function ApiKeysPanel() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [name, setName] = useState("Default");
  const [loading, setLoading] = useState(false);
  const [rawOnce, setRawOnce] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/keys");
    if (!res.ok) return;
    const data = (await res.json()) as { keys: KeyRow[] };
    setKeys(data.keys);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createKey() {
    setLoading(true);
    setError(null);
    setRawOnce(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as {
        rawKey?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not create key");
        return;
      }
      setRawOnce(data.rawKey ?? null);
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this API key?")) return;
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer API keys</CardTitle>
        <CardDescription>
          Access BetEdge Odds via <code className="text-accent">/api/v1/odds</code>. See{" "}
          <a href="/docs/api" className="text-accent underline">
            API docs
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name"
            className="sm:max-w-xs"
          />
          <Button onClick={createKey} disabled={loading}>
            {loading ? "Creating…" : "Create key"}
          </Button>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        {rawOnce && (
          <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">
            <p className="font-semibold text-accent">Copy now — shown once</p>
            <code className="mt-1 block break-all font-mono text-xs">{rawOnce}</code>
          </div>
        )}

        <div className="space-y-2">
          {keys.length === 0 && (
            <p className="text-sm text-muted">No keys yet.</p>
          )}
          {keys.map((k) => (
            <div
              key={k.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-card-border bg-background/50 px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium">
                  {k.name}{" "}
                  <span className="font-mono text-xs text-muted">{k.keyPrefix}…</span>
                </div>
                <div className="text-xs text-muted">
                  {k.requestsDay} today · {k.requestsAll} all-time
                  {k.revokedAt ? " · revoked" : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={k.revokedAt ? "danger" : "accent"}>{k.planTier}</Badge>
                {!k.revokedAt && (
                  <Button size="sm" variant="danger" onClick={() => revoke(k.id)}>
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
