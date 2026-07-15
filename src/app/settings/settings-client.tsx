"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiKeysPanel } from "@/components/settings/api-keys-panel";
import type { Plan, SubscriptionStatus } from "@prisma/client";

export function SettingsClient({
  user,
  subscription,
}: {
  user: {
    name: string | null;
    email: string;
    plan: Plan;
    bankrollCents: number;
    unitSizeCents: number;
  };
  subscription: {
    status: SubscriptionStatus;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    hasStripe: boolean;
  } | null;
}) {
  const [loading, setLoading] = useState<"BASIC" | "PRO" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(plan: "BASIC" | "PRO") {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  async function portal() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Portal unavailable");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted">Name</span>
            <span>{user.name ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Plan</span>
            <Badge variant="accent">{user.plan}</Badge>
          </div>
          {subscription && (
            <div className="flex justify-between gap-4">
              <span className="text-muted">Billing status</span>
              <span>{subscription.status}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Upgrade for unlimited picks and full analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={user.plan === "BASIC" ? "secondary" : "default"}
              disabled={loading !== null || user.plan === "BASIC"}
              onClick={() => checkout("BASIC")}
            >
              {loading === "BASIC" ? "Redirecting…" : "Basic — $19/mo"}
            </Button>
            <Button
              variant={user.plan === "PRO" ? "secondary" : "default"}
              disabled={loading !== null || user.plan === "PRO"}
              onClick={() => checkout("PRO")}
            >
              {loading === "PRO" ? "Redirecting…" : "Pro — $49/mo"}
            </Button>
            <Button
              variant="outline"
              disabled={loading !== null || !subscription?.hasStripe}
              onClick={portal}
            >
              {loading === "portal" ? "Opening…" : "Manage billing"}
            </Button>
          </div>
          <p className="text-xs text-muted">
            Stripe test mode supported. Configure price IDs in environment variables.
          </p>
        </CardContent>
      </Card>

      <ApiKeysPanel />

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="danger" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
