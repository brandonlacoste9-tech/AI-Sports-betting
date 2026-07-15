import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PerformanceCard({
  wins,
  losses,
  pushes,
  winRate,
  unitsProfit,
  roiPercent,
  totalPicks,
  limited,
  title = "Performance tracker",
  description,
}: {
  wins: number;
  losses: number;
  pushes: number;
  winRate: number;
  unitsProfit: number;
  roiPercent: number;
  totalPicks: number;
  limited?: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description ??
            (limited
              ? "Free plan shows summary only. Upgrade for full ROI analytics."
              : "All-time graded picks (demo + live).")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Graded" value={`${totalPicks}`} />
          <Stat label="Wins" value={`${wins}`} accent />
          <Stat label="Losses" value={`${losses}`} />
          <Stat label="Pushes" value={`${pushes}`} />
          <Stat label="Win rate" value={`${winRate.toFixed(1)}%`} accent />
          {!limited ? (
            <>
              <Stat
                label="Units"
                value={`${unitsProfit >= 0 ? "+" : ""}${unitsProfit.toFixed(2)}u`}
                accent={unitsProfit >= 0}
              />
              <Stat
                label="ROI"
                value={`${roiPercent >= 0 ? "+" : ""}${roiPercent.toFixed(1)}%`}
                className="col-span-2 sm:col-span-1"
              />
            </>
          ) : (
            <Stat label="ROI / Units" value="Pro" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-card-border bg-background/50 p-3 ${className ?? ""}`}>
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${accent ? "text-accent" : ""}`}>{value}</div>
    </div>
  );
}
