"use client";

import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import { StakeAffiliateCta } from "@/components/shared/affiliate-cta";
import { PicksList, type PickCardData } from "@/components/dashboard/picks-list";
import { PerformanceCard } from "@/components/dashboard/performance-card";
import { BankrollCalculator } from "@/components/dashboard/bankroll-calculator";
import { useT } from "@/components/providers/locale-provider";

export function DashboardShell({
  firstName,
  plan,
  freeSlotsRemaining,
  todayPicks,
  historyPicks,
  perf,
  fullAnalytics,
  bankroll,
  unit,
}: {
  firstName?: string | null;
  plan: string;
  freeSlotsRemaining: number | null;
  todayPicks: PickCardData[];
  historyPicks: PickCardData[];
  perf: {
    wins: number;
    losses: number;
    pushes: number;
    winRate: number;
    unitsProfit: number;
    roiPercent: number;
    totalPicks: number;
  };
  fullAnalytics: boolean;
  bankroll: number;
  unit: number;
}) {
  const t = useT();

  return (
    <div className="bg-grid mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.dashboard.hey}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-muted">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">
            {plan} {t.dashboard.planSuffix}
          </Badge>
          {freeSlotsRemaining !== null && (
            <Badge variant="muted">
              {freeSlotsRemaining} {t.dashboard.freeUnlocks}
            </Badge>
          )}
        </div>
      </div>

      <Disclaimer />
      <StakeAffiliateCta />

      <PerformanceCard
        wins={perf.wins}
        losses={perf.losses}
        pushes={perf.pushes}
        winRate={perf.winRate}
        unitsProfit={perf.unitsProfit}
        roiPercent={perf.roiPercent}
        totalPicks={perf.totalPicks}
        limited={!fullAnalytics}
        title={t.dashboard.performance}
        description={
          fullAnalytics ? t.dashboard.performanceFull : t.dashboard.performanceLimited
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <PicksList title={t.dashboard.todaysPicks} picks={todayPicks} />
          <PicksList
            title={t.dashboard.recentHistory}
            picks={historyPicks}
            emptyMessage={t.dashboard.noHistory}
          />
        </div>
        <div className="lg:col-span-2">
          <BankrollCalculator
            defaultBankroll={bankroll}
            defaultUnit={unit}
            title={t.dashboard.bankroll}
            description={t.dashboard.bankrollDesc}
          />
        </div>
      </div>
    </div>
  );
}
