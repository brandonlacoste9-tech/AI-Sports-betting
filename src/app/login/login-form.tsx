"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/components/providers/locale-provider";

const REMEMBER_EMAIL_KEY = "betedge_remember_email";

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {
      // ignore private mode
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      remember: remember ? "true" : "false",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(t.auth.invalidCreds);
      return;
    }

    try {
      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim().toLowerCase());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch {
      // ignore
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

          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-card-border accent-[var(--accent,#22d3ee)]"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>{t.auth.rememberMe}</span>
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
