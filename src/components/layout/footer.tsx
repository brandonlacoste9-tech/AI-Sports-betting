import Link from "next/link";
import { Disclaimer } from "@/components/shared/disclaimer";

export function Footer() {
  return (
    <footer className="border-t border-card-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="font-semibold">
            BetEdge <span className="text-accent">AI</span>
          </div>
          <div className="flex gap-4 text-sm text-muted">
            <Link href="/#pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Login
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
        <Disclaimer />
        <p className="text-xs text-muted/70">
          © {new Date().getFullYear()} BetEdge AI. Not a sportsbook. Tips & analytics only.
        </p>
      </div>
    </footer>
  );
}
