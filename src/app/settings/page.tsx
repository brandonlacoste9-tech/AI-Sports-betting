import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsClient } from "./settings-client";
import { SettingsHeadings } from "./settings-headings";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="bg-grid mx-auto max-w-3xl px-4 py-10">
      <SettingsHeadings />
      {params.checkout === "success" && (
        <p className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          Payment successful. Your plan updates within a few seconds after Stripe webhook.
        </p>
      )}
      {params.checkout === "cancel" && (
        <p className="mt-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          Checkout canceled. No charge was made.
        </p>
      )}
      <div className="mt-8">
        <SettingsClient
          user={{
            name: user.name,
            email: user.email,
            plan: user.plan,
            bankrollCents: user.bankrollCents,
            unitSizeCents: user.unitSizeCents,
          }}
          subscription={
            user.subscription
              ? {
                  status: user.subscription.status,
                  currentPeriodEnd: user.subscription.currentPeriodEnd?.toISOString() ?? null,
                  cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
                  hasStripe: Boolean(user.subscription.stripeCustomerId),
                }
              : null
          }
        />
      </div>
    </div>
  );
}
