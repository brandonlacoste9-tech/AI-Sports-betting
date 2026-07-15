"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/components/providers/locale-provider";

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(t.auth.invalidCreds);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t.common.email}</span>
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t.common.password}</span>
            <Input
              type="password"
              required
              autoComplete="current-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.auth.signingIn : t.nav.login}
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          {t.auth.noAccount}{" "}
          <Link href="/register" className="text-accent hover:underline">
            {t.nav.signUp}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
