import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import {
  Activity,
  Brain,
  LineChart,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI pick engine",
    body: "Grok analyzes markets, injuries, weather, and line moves into structured daily picks.",
  },
  {
    icon: Target,
    title: "Edge + confidence",
    body: "Every pick ships with estimated edge, confidence score, and unit guidance.",
  },
  {
    icon: LineChart,
    title: "Performance tracker",
    body: "Transparent win rate, units, and ROI — no cherry-picked screenshots.",
  },
  {
    icon: Zap,
    title: "Bankroll tools",
    body: "Fractional Kelly helper and unit sizing so you size bets like a pro.",
  },
  {
    icon: Activity,
    title: "Multi-sport coverage",
    body: "NFL, NBA, MLB, NHL, UFC, and Soccer prioritized for daily slates.",
  },
  {
    icon: Shield,
    title: "Responsible by design",
    body: "Clear disclaimers, no guaranteed profits, entertainment-first product framing.",
  },
  {
    icon: LineChart,
    title: "Odds board + API",
    body: "Public odds board, line-move history for paid plans, and a developer API with keys.",
  },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    blurb: "Taste the edge",
    features: ["1 pick per day", "7-day limited history", "Win-rate summary", "Bankroll calculator"],
    cta: "Start free",
    href: "/register",
    highlight: false,
  },
  {
    name: "Basic",
    price: "$19",
    blurb: "Full daily board",
    features: [
      "Unlimited daily picks",
      "Full history & analytics",
      "Line moves board",
      "Odds API (2k req/day)",
    ],
    cta: "Go Basic",
    href: "/register?plan=basic",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$49",
    blurb: "High-edge unlocks",
    features: [
      "Everything in Basic",
      "Premium high-confidence picks",
      "Odds API (20k req/day)",
      "Advanced ROI tracking",
    ],
    cta: "Go Pro",
    href: "/register?plan=pro",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="bg-grid">
      {/* Hero — multi-sport collage faded behind copy */}
      <section className="relative overflow-hidden border-b border-card-border/40">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-sports.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />
          {/* Fade layers so headline stays readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_72%)]" />
          <div className="absolute inset-0 bg-background/30" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="accent" className="mb-4 shadow-lg shadow-black/40">
              <Sparkles className="mr-1 h-3 w-3" /> AI-powered betting intelligence
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)] md:text-6xl">
              Daily sports picks with{" "}
              <span className="text-accent">real edge analysis</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted drop-shadow-[0_1px_12px_rgba(0,0,0,0.9)]">
              BetEdge AI turns odds, injuries, weather, and line movement into clear, ranked picks
              for NFL, NBA, MLB, NHL, UFC, and Soccer — so you stop doomscrolling research at
              midnight.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="glow-accent">
                  Get today&apos;s free pick
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Log in
                </Button>
              </Link>
            </div>
            <div className="mt-6 rounded-xl border border-card-border/50 bg-background/50 px-4 py-3 backdrop-blur-sm">
              <Disclaimer className="mx-auto max-w-xl text-center" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Built for bettors who want process</h2>
          <p className="mt-2 text-muted">
            Not a sportsbook. A research co-pilot that ships a board you can actually action.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <f.icon className="mb-2 h-6 w-6 text-accent" />
                <CardTitle className="text-base">{f.title}</CardTitle>
                <CardDescription>{f.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Simple freemium pricing</h2>
          <p className="mt-2 text-muted">Cancel anytime. Stripe-secured billing.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <Card
              key={t.name}
              className={t.highlight ? "border-accent/50 glow-accent" : undefined}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t.name}
                  {t.highlight && <Badge variant="accent">Popular</Badge>}
                </CardTitle>
                <CardDescription>{t.blurb}</CardDescription>
                <div className="pt-2 text-4xl font-bold">
                  {t.price}
                  <span className="text-base font-normal text-muted">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted">
                  {t.features.map((feat) => (
                    <li key={feat} className="flex gap-2">
                      <span className="text-accent">✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <Link href={t.href} className="block">
                  <Button className="w-full" variant={t.highlight ? "default" : "secondary"}>
                    {t.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Card className="overflow-hidden border-accent/20">
          <CardContent className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">Ship your edge before first pitch / kickoff</h2>
              <p className="mt-2 max-w-xl text-muted">
                Join freemium, unlock one AI pick today, upgrade when you want the full board.
              </p>
            </div>
            <Link href="/register">
              <Button size="lg">Create free account</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
