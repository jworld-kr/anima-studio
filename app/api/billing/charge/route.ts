import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import {
  PlanId,
  TOSS_API_BASE,
  addOneMonth,
  generateOrderId,
  getPlan,
  tossAuthHeader,
} from "@/app/lib/billing";
import { grantSubscriptionInk } from "@/app/lib/ink-server";

/**
 * Recurring charge worker.
 *
 * Authenticated by a shared secret (CRON_SECRET) so only our cron job
 * (Supabase Edge Function or Vercel Cron) can invoke it.
 *
 * For every subscription whose current_period_end has passed and is
 * still 'active' / not cancelled, charge the next month using the
 * stored billingKey.
 */

interface ChargeOutcome {
  userId: string;
  plan: PlanId;
  status: "renewed" | "failed" | "expired" | "skipped";
  reason?: string;
}

export async function POST(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET_NOT_CONFIGURED" },
      { status: 500 }
    );
  }
  const provided =
    req.headers.get("x-cron-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (provided !== expected) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const now = new Date();

  // Find subscriptions that need charging.
  const { data: due, error: dueErr } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id, plan, current_period_end, cancel_at_period_end")
    .eq("status", "active")
    .lte("current_period_end", now.toISOString());

  if (dueErr) {
    console.error(dueErr);
    return NextResponse.json({ error: "DB_QUERY_FAILED" }, { status: 500 });
  }

  const outcomes: ChargeOutcome[] = [];

  for (const sub of due ?? []) {
    const plan = getPlan(sub.plan);
    if (!plan || plan.id === "free") {
      outcomes.push({
        userId: sub.user_id,
        plan: sub.plan as PlanId,
        status: "skipped",
        reason: "INVALID_PLAN",
      });
      continue;
    }

    // If user requested cancellation at period end, expire instead of charging
    if (sub.cancel_at_period_end) {
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "expired",
          plan: "free",
        })
        .eq("id", sub.id);
      outcomes.push({
        userId: sub.user_id,
        plan: sub.plan as PlanId,
        status: "expired",
      });
      continue;
    }

    // Look up billing key
    const { data: bk } = await supabaseAdmin
      .from("billing_keys")
      .select("billing_key, customer_key")
      .eq("user_id", sub.user_id)
      .single();
    if (!bk) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("id", sub.id);
      outcomes.push({
        userId: sub.user_id,
        plan: sub.plan as PlanId,
        status: "failed",
        reason: "NO_BILLING_KEY",
      });
      continue;
    }

    // Find user email for receipt
    const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(
      sub.user_id
    );
    const email = userRes?.user?.email;

    const orderId = generateOrderId(sub.user_id, plan.id);
    const orderName = `Anima ${plan.name} 월 구독`;

    try {
      const res = await fetch(`${TOSS_API_BASE}/billing/${bk.billing_key}`, {
        method: "POST",
        headers: {
          Authorization: tossAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerKey: bk.customer_key,
          amount: plan.price,
          orderId,
          orderName,
          customerEmail: email,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        await supabaseAdmin.from("payments").insert({
          user_id: sub.user_id,
          subscription_id: sub.id,
          toss_order_id: orderId,
          amount: plan.price,
          status: "failed",
          failure_reason: errBody,
        });
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("id", sub.id);
        outcomes.push({
          userId: sub.user_id,
          plan: plan.id,
          status: "failed",
          reason: errBody.slice(0, 200),
        });
        continue;
      }

      const charge = await res.json();
      const newPeriodEnd = addOneMonth(now);

      await supabaseAdmin.from("payments").insert({
        user_id: sub.user_id,
        subscription_id: sub.id,
        toss_payment_key: charge.paymentKey,
        toss_order_id: charge.orderId,
        amount: plan.price,
        status: "succeeded",
        paid_at: charge.approvedAt ?? now.toISOString(),
        raw_response: charge,
      });

      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: newPeriodEnd.toISOString(),
        })
        .eq("id", sub.id);

      // Refill monthly ink for the new period
      await grantSubscriptionInk({
        userId: sub.user_id,
        plan: plan.id,
        earlyAccess: true,
        force: true,
        referenceId: sub.id,
      }).catch((e) => console.error("[ink grant on renewal failed]", e));

      outcomes.push({
        userId: sub.user_id,
        plan: plan.id,
        status: "renewed",
      });
    } catch (e) {
      console.error(e);
      outcomes.push({
        userId: sub.user_id,
        plan: plan.id,
        status: "failed",
        reason: "REQUEST_ERROR",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: outcomes.length,
    outcomes,
  });
}
