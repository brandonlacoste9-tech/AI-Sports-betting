"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { americanToDecimal } from "@/lib/utils";

export function BankrollCalculator({
  defaultBankroll = 1000,
  defaultUnit = 10,
  title = "Bankroll calculator",
  description = "Unit sizing + fractional Kelly helper. Educational only — not financial advice.",
}: {
  defaultBankroll?: number;
  defaultUnit?: number;
  title?: string;
  description?: string;
}) {
  const [bankroll, setBankroll] = useState(defaultBankroll);
  const [unitPct, setUnitPct] = useState(
    defaultBankroll > 0 ? (defaultUnit / defaultBankroll) * 100 : 1,
  );
  const [odds, setOdds] = useState(-110);
  const [edge, setEdge] = useState(3);
  const [fraction, setFraction] = useState(0.25);

  const unitSize = useMemo(() => (bankroll * unitPct) / 100, [bankroll, unitPct]);

  const kelly = useMemo(() => {
    const decimal = americanToDecimal(odds);
    const b = decimal - 1;
    // Convert edge% into rough win prob vs implied
    const implied =
      odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
    const p = Math.min(0.95, Math.max(0.05, implied + edge / 100));
    const q = 1 - p;
    const full = b > 0 ? (b * p - q) / b : 0;
    const fractional = Math.max(0, full * fraction);
    return {
      full: full * 100,
      fractional: fractional * 100,
      stake: bankroll * fractional,
      units: unitSize > 0 ? (bankroll * fractional) / unitSize : 0,
    };
  }, [bankroll, odds, edge, fraction, unitSize]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">Bankroll ($)</span>
          <Input
            type="number"
            min={0}
            value={bankroll}
            onChange={(e) => setBankroll(Number(e.target.value))}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">Unit size (% of bankroll)</span>
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={unitPct}
            onChange={(e) => setUnitPct(Number(e.target.value))}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">American odds</span>
          <Input
            type="number"
            value={odds}
            onChange={(e) => setOdds(Number(e.target.value))}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">Estimated edge (%)</span>
          <Input
            type="number"
            step={0.1}
            value={edge}
            onChange={(e) => setEdge(Number(e.target.value))}
          />
        </label>
        <label className="grid gap-1.5 text-sm sm:col-span-2">
          <span className="text-muted">Kelly fraction (0.25 = quarter Kelly)</span>
          <Input
            type="number"
            min={0.05}
            max={1}
            step={0.05}
            value={fraction}
            onChange={(e) => setFraction(Number(e.target.value))}
          />
        </label>

        <div className="sm:col-span-2 grid grid-cols-2 gap-3 rounded-lg border border-card-border bg-background/60 p-4 text-sm md:grid-cols-4">
          <div>
            <div className="text-muted">1 unit</div>
            <div className="text-lg font-semibold text-accent">${unitSize.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted">Full Kelly</div>
            <div className="text-lg font-semibold">{kelly.full.toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-muted">Suggested stake</div>
            <div className="text-lg font-semibold">${kelly.stake.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted">Suggested units</div>
            <div className="text-lg font-semibold">{kelly.units.toFixed(2)}u</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
