"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import { StakeAffiliateCta } from "@/components/shared/affiliate-cta";
import { useT } from "@/components/providers/locale-provider";
import {
  Activity,
  Brain,
  LineChart,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const featureIcons = [Brain, Target, LineChart, Zap, Activity, Shield, LineChart];

export default function LandingPage() {
  const t = useT();
  const L = t.landing;

  const tiers = [
    {
      ...L.tiers[0],
      price: "$0",
      href: "/register",
      highlight: false,
    },
    {
      ...L.tiers[1],
      price: "$19",
      href: "/register?plan=basic",
      highlight: true,
    },
    {
      ...L.tiers[2],
      price: "$49",
      href: "/register?plan=pro",
      highlight: false,
    },
  ];

  return (
    <div className="bg-grid">
      <section className="relative min-h-[70vh] overflow-hidden border-b border-card-border/40 md:min-h-[78vh]">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-sports.jpg"
            alt="Multi-sport collage: football, basketball, baseball, hockey, soccer, MMA"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-110 contrast-110 saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-background" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center px-4 py-16 md:min-h-[78vh] md:py-24">
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-black/55 px-6 py-10 text-center shadow-2xl shadow-black/50 backdrop-blur-md md:px-10 md:py-12">
            <Badge variant="accent" className="mb-4 shadow-lg shadow-black/40">
              <Sparkles className="mr-1 h-3 w-3" /> {L.badge}
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-6xl">
              {L.heroTitleBefore}{" "}
              <span className="text-accent">{L.heroTitleAccent}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-zinc-200">
              {L.heroBody}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="glow-accent">
                  {L.ctaFree}
                </Button>
              </Link>
              <Link href="/games">
                <Button size="lg" variant="secondary">
                  Play free games
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  {L.ctaLogin}
                </Button>
              </Link>
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
              <Disclaimer className="mx-auto max-w-xl text-center text-zinc-400" />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">{L.featuresTitle}</h2>
          <p className="mt-2 text-muted">{L.featuresSubtitle}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {L.features.map((f, i) => {
            const Icon = featureIcons[i] ?? Brain;
            return (
              <Card key={f.title}>
                <CardHeader>
                  <Icon className="mb-2 h-6 w-6 text-accent" />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <CardDescription>{f.body}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">{L.pricingTitle}</h2>
          <p className="mt-2 text-muted">{L.pricingSubtitle}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.highlight ? "border-accent/50 glow-accent" : undefined}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {tier.name}
                  {tier.highlight && <Badge variant="accent">{L.popular}</Badge>}
                </CardTitle>
                <CardDescription>{tier.blurb}</CardDescription>
                <div className="pt-2 text-4xl font-bold">
                  {tier.price}
                  <span className="text-base font-normal text-muted">{L.perMonth}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex gap-2">
                      <span className="text-accent">✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <Link href={tier.href} className="block">
                  <Button className="w-full" variant={tier.highlight ? "default" : "secondary"}>
                    {tier.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-16">
        <StakeAffiliateCta />
        <Card className="overflow-hidden border-accent/20">
          <CardContent className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">{L.ctaSectionTitle}</h2>
              <p className="mt-2 max-w-xl text-muted">{L.ctaSectionBody}</p>
            </div>
            <Link href="/register">
              <Button size="lg">{L.ctaCreate}</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
