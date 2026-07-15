"use client";

import { useT } from "@/components/providers/locale-provider";

export function SettingsHeadings() {
  const t = useT();
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">{t.settings.title}</h1>
      <p className="mt-1 text-muted">{t.settings.subtitle}</p>
    </>
  );
}
