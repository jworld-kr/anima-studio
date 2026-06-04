import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import {
  PlanId,
  TOSS_API_BASE,
  addOneMonth,
  getPlan,
  tossAuthHeader,
} from "@/app/lib/billing";
import { grantSubscriptionInk } from "@/app/lib/ink-server";

/**
 * One-shot payment confirmation. Used while the Toss billing(자동결제)
 * contract is still pending. Activates the subscription for one month
 * but stores no billing key, so there's no automatic renewal.
 *
 * Flow:
 *   1. User completes Toss payment widget on the client.
 *   2. Toss redirects to /test-checkout/success with paymentKey,
 *      orderId, amount.
 *   3. The success page calls this endpoint to finalize the charge.
 *   4. We confirm the payment via Toss server API and persist the
 *      subscription + payment.
 */

interface ConfirmBody {
  paymentKey: string;
  orderId: string;
  amount: number;
  planId: PlanId;
}

export async function POST(req: NextRequest) {
  let body: ConfirmBody;
  try {
    body = (await req.json()) as ConfirmBody;
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { paymentKey, orderId, amount, planId } = body;
  if (!paymentKey || !orderId || !amount || !planId) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const plan = getPlan(planId);
  if (!plan || plan.id === "free") {
    return NextResponse.json({ error: "INVALID_PLAN" }, { status: 400 });
  }

  // Sanity-check the amount client claims matches the plan price.
  if (amount !== plan.price) {
    return NextResponse.json(
      { error: "AMOUNT_MISMATCH", expected: plan.price, got: amount },
      { status: 400 }
    );
  }

  const accessToken = req.headers
    .get("authorization")
    ?.replace(/^Bearer /, "");
  if (!accessToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Confirm payment with Toss
  let confirmRes: {
    paymentKey: string;
    orderId: string;
    status: string;
    approvedAt?: string;
  };
  try {
    const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
      method: "POST",
      headers: {
        Authorization: tossAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error("[toss confirm] failed:", res.status, errBody);
      await supabaseAdmin.from("payments").insert({
        user_id: user.id,
        toss_order_id: orderId,
        toss_payment_key: paymentKey,
        amount,
        status: "failed",
        failure_reason: errBody,
      });
      return NextResponse.json(
        { error: "CONFIRM_FAILED", detail: errBody },
        { status: 502 }
      );
    }
    confirmRes = await res.json();
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "CONFIRM_REQUEST_FAILED" },
      { status: 502 }
    );
  }

  // Activate subscription for one month
  const now = new Date();
  const periodEnd = addOneMonth(now);

  const { data: sub, error: subErr } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        plan: planId,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: true, // no auto-renew without billingKey
        cancelled_at: null,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (subErr || !sub) {
    console.error(subErr);
    return NextResponse.json(
      { error: "DB_SUBSCRIPTION_SAVE_FAILED" },
      { status: 500 }
    );
  }

  await supabaseAdmin.from("payments").insert({
    user_id: user.id,
    subscription_id: sub.id,
    toss_payment_key: confirmRes.paymentKey,
    toss_order_id: confirmRes.orderId,
    amount,
    status: "succeeded",
    paid_at: confirmRes.approvedAt ?? now.toISOString(),
    raw_response: confirmRes,
  });

  // Grant monthly ink (one-time payment also unlocks one period of ink)
  await grantSubscriptionInk({
    userId: user.id,
    plan: planId,
    earlyAccess: true,
    force: true,
    referenceId: sub.id,
  }).catch((e) => console.error("[ink grant failed]", e));

  return NextResponse.json({
    ok: true,
    plan: planId,
    nextBillingDate: periodEnd.toISOString(),
    autoRenew: false,
  });
}
