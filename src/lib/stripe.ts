import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // Pin to a stable recent API; upgrade when Stripe SDK changelog requires it
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeClient;
}

export function getPriceIdForPlan(plan: "BASIC" | "PRO"): string {
  const id =
    plan === "PRO" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_BASIC;
  if (!id) {
    throw new Error(`Stripe price ID for ${plan} is not configured`);
  }
  return id;
}
