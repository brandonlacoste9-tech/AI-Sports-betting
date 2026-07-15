"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/components/providers/locale-provider";

export function RegisterForm() {
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? t.auth.regFailed);
      setLoading(false);
      return;
    }

    const login = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (login?.error) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t.common.name}</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
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
            <span className="text-muted">{t.auth.passwordMin}</span>
            <Input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.auth.creating : t.auth.createAccount}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          {t.auth.hasAccount}{" "}
          <Link href="/login" className="text-accent hover:underline">
            {t.nav.login}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
