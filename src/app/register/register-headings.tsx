"use client";

import { useT } from "@/components/providers/locale-provider";

export function RegisterHeadings() {
  const t = useT();
  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-bold">{t.auth.registerTitle}</h1>
      <p className="mt-1 text-sm text-muted">{t.auth.registerSubtitle}</p>
    </div>
  );
}
