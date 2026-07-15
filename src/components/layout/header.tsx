"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useT } from "@/components/providers/locale-provider";

export function Header() {
  const { data: session } = useSession();
  const t = useT();

  return (
    <header className="sticky top-0 z-40 border-b border-card-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm text-black glow-accent">
            BE
          </span>
          <span className="hidden sm:inline">
            BetEdge <span className="text-accent">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted lg:flex">
          <Link href="/odds" className="hover:text-foreground">
            {t.nav.odds}
          </Link>
          <Link href="/docs/api" className="hover:text-foreground">
            {t.nav.api}
          </Link>
          <Link href="/#pricing" className="hover:text-foreground">
            {t.nav.pricing}
          </Link>
          {session?.user && (
            <>
              <Link href="/dashboard" className="hover:text-foreground">
                {t.nav.dashboard}
              </Link>
              <Link href="/line-moves" className="hover:text-foreground">
                {t.nav.lineMoves}
              </Link>
              <Link href="/settings" className="hover:text-foreground">
                {t.nav.settings}
              </Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="hover:text-foreground">
                  {t.nav.admin}
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {session?.user ? (
            <>
              <Badge variant="accent" className="hidden sm:inline-flex">
                {session.user.plan}
              </Badge>
              <Link href="/dashboard">
                <Button size="sm">{t.nav.dashboard}</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t.nav.startFree}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
