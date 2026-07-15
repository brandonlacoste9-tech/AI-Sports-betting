import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/shared/disclaimer";

export const metadata: Metadata = {
  title: "Odds API docs",
  description: "BetEdge developer odds API — authentication, endpoints, and rate limits.",
};

const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://sparkling-seahorse-04a44d.netlify.app";

export default function ApiDocsPage() {
  return (
    <div className="bg-grid mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div>
        <Badge variant="accent" className="mb-2">
          Developer
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">BetEdge Odds API</h1>
        <p className="mt-2 text-muted">
          Query our stored odds board and line moves. Create keys in Settings after signup.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/settings">
            <Button size="sm">Get API key</Button>
          </Link>
          <Link href="/odds">
            <Button size="sm" variant="secondary">
              Public board
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Pass your key on every request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <pre className="overflow-x-auto rounded-lg border border-card-border bg-background p-4 font-mono text-xs">
            {`Authorization: Bearer be_live_xxxxxxxx
# or
x-api-key: be_live_xxxxxxxx`}
          </pre>
          <p className="text-muted">
            Keys are shown once at creation. Revoke anytime in Settings.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate limits by plan</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="space-y-2 text-muted">
            <li>
              <strong className="text-foreground">Free</strong> — 100 req/day · 1 key · odds only
            </li>
            <li>
              <strong className="text-foreground">Basic ($19)</strong> — 2,000 req/day · 2 keys ·
              odds + line-moves
            </li>
            <li>
              <strong className="text-foreground">Pro ($49)</strong> — 20,000 req/day · 5 keys · full
              access
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GET /api/v1/odds</CardTitle>
          <CardDescription>Latest stored events and markets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted">Query: <code className="text-accent">sport</code> (optional NFL…),{" "}
            <code className="text-accent">limit</code> (1–100)</p>
          <pre className="overflow-x-auto rounded-lg border border-card-border bg-background p-4 font-mono text-xs">
            {`curl -H "Authorization: Bearer be_live_..." \\
  "${base}/api/v1/odds?sport=MLB&limit=20"`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GET /api/v1/line-moves</CardTitle>
          <CardDescription>Requires Basic or Pro</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted">
            Query: <code className="text-accent">sport</code>,{" "}
            <code className="text-accent">limit</code>,{" "}
            <code className="text-accent">hours</code> (1–168)
          </p>
          <pre className="overflow-x-auto rounded-lg border border-card-border bg-background p-4 font-mono text-xs">
            {`curl -H "Authorization: Bearer be_live_..." \\
  "${base}/api/v1/line-moves?hours=48&limit=30"`}
          </pre>
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  );
}
