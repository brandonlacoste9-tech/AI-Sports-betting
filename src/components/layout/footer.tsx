"use client";

import Link from "next/link";
import { Disclaimer } from "@/components/shared/disclaimer";
import { useT } from "@/components/providers/locale-provider";

export function Footer() {
  const t = useT();

  return (
    <footer className="border-t border-card-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="font-semibold">
            BetEdge <span className="text-accent">AI</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <Link href="/record" className="hover:text-foreground">
              {t.nav.record}
            </Link>
            <Link href="/odds" className="hover:text-foreground">
              {t.nav.odds}
            </Link>
            <Link href="/#pricing" className="hover:text-foreground">
              {t.nav.pricing}
            </Link>
            <Link href="/login" className="hover:text-foreground">
              {t.nav.login}
            </Link>
            <Link href="/register" className="hover:text-foreground">
              {t.nav.signUp}
            </Link>
          </div>
        </div>
        <Disclaimer />
        <p className="text-xs text-muted/70">
          © {new Date().getFullYear()} BetEdge AI. {t.footer.notSportsbook}
        </p>
      </div>
    </footer>
  );
}
