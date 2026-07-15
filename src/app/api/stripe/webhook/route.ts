import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { planFromStripePriceId } from "@/lib/subscriptions";
import type { Plan, SubscriptionStatus } from "@prisma/client";

export const runtime = "nodejs";

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "trialing":
      return "TRIALING";
    default:
      return "INACTIVE";
  }
}

async function syncSubscription(stripeSub: Stripe.Subscription, userId?: string) {
  const priceId = stripeSub.items.data[0]?.price.id ?? null;
  const plan: Plan = planFromStripePriceId(priceId);
  const status = mapStripeStatus(stripeSub.status);
  const customerId =
    typeof stripeSub.customer === "string" ? stripeSub.customer : stripeSub.customer.id;

  const resolvedUserId =
    userId ??
    stripeSub.metadata.userId ??
    (
      await prisma.subscription.findFirst({
        where: { stripeCustomerId: customerId },
        select: { userId: true },
      })
    )?.userId;

  if (!resolvedUserId) {
    console.warn("[stripe webhook] No user for subscription", stripeSub.id);
    return;
  }

  const periodStart = stripeSub.current_period_start
    ? new Date(stripeSub.current_period_start * 1000)
    : null;
  const periodEnd = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : null;

  const activePlan = status === "ACTIVE" || status === "TRIALING" ? plan : "FREE";

  await prisma.subscription.upsert({
    where: { userId: resolvedUserId },
    create: {
      userId: resolvedUserId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      plan: activePlan,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      plan: activePlan,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  });

  await prisma.user.update({
    where: { id: resolvedUserId },
    data: { plan: activePlan },
  });
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[stripe webhook] signature error", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const stripeSub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(stripeSub, session.metadata?.userId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof stripeSub.customer === "string"
            ? stripeSub.customer
            : stripeSub.customer.id;
        const existing = await prisma.subscription.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: stripeSub.id },
              { stripeCustomerId: customerId },
            ],
          },
        });
        if (existing) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              status: "CANCELED",
              plan: "FREE",
              stripeSubscriptionId: null,
              stripePriceId: null,
            },
          });
          await prisma.user.update({
            where: { id: existing.userId },
            data: { plan: "FREE" },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
