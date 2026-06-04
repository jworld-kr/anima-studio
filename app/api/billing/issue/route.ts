import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import {
  PlanId,
  TOSS_API_BASE,
  addOneMonth,
  generateCustomerKey,
  generateOrderId,
  getPlan,
  tossAuthHeader,
} from "@/app/lib/billing";
import { grantSubscriptionInk } from "@/app/lib/ink-server";

/**
 * Issue billing key + run first charge.
 *
 * Flow:
 *   1. User completes the Toss billing widget on the client.
 *   2. Toss redirects to /checkout/success with `authKey` and `customerKey`.
 *   3. The success page calls this endpoint with the authKey + planId.
 *   4. We exchange authKey → billingKey via Toss server API.
 *   5. We immediately charge the first month with that billingKey.
 *   6. We persist billing_keys, subscriptions, and payments rows.
 */

interface IssueBody {
  authKey: string;
  customerKey: string;
  planId: PlanId;
}

export async function POST(req: NextRequest) {
  let body: IssueBody;
  try {
    body = (await req.json()) as IssueBody;
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { authKey, customerKey, planId } = body;
  if (!authKey || !customerKey || !planId) {
    return NextResponse.json(
      { error: "MISSING_FIELDS" },
      { status: 400 }
    );
  }

  const plan = getPlan(planId);
  if (!plan || plan.id === "free") {
    return NextResponse.json({ error: "INVALID_PLAN" }, { status: 400 });
  }

  // Authenticate the calling user with their Supabase session.
  const accessToken = req.headers.get("authorization")?.replace(/^Bearer /, "");
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

  // Verify the customerKey matches what we expect for this user
  const expectedCustomerKey = generateCustomerKey(user.id);
  if (customerKey !== expectedCustomerKey) {
    return NextResponse.json(
      { error: "CUSTOMER_KEY_MISMATCH" },
      { status: 400 }
    );
  }

  // 1) Exchange authKey → billingKey
  let billingKeyRes: {
    billingKey: string;
    cardCompany?: string;
    cardNumber?: string;
  };
  try {
    const res = await fetch(`${TOSS_API_BASE}/billing/authorizations/issue`, {
      method: "POST",
      headers: {
        Authorization: tossAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ authKey, customerKey }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error("[toss billing issue] failed:", res.status, errBody);
      return NextResponse.json(
        { error: "BILLING_KEY_ISSUE_FAILED", detail: errBody },
        { status: 502 }
      );
    }
    billingKeyRes = await res.json();
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "BILLING_KEY_REQUEST_FAILED" },
      { status: 502 }
    );
  }

  // 2) Persist billing_keys (upsert — one per user)
  const { error: bkErr } = await supabaseAdmin
    .from("billing_keys")
    .upsert(
      {
        user_id: user.id,
        customer_key: customerKey,
        billing_key: billingKeyRes.billingKey,
        card_company: billingKeyRes.cardCompany ?? null,
        card_number: billingKeyRes.cardNumber ?? null,
      },
      { onConflict: "user_id" }
    );
  if (bkErr) {
    console.error(bkErr);
    return NextResponse.json(
      { error: "DB_BILLING_KEY_SAVE_FAILED" },
      { status: 500 }
    );
  }

  // 3) Charge first month
  const orderId = generateOrderId(user.id, planId);
  const orderName = `Anima ${plan.name} 월 구독`;
  let chargeRes: {
    paymentKey: string;
    orderId: string;
    status: string;
    approvedAt?: string;
  };
  try {
    const res = await fetch(
      `${TOSS_API_BASE}/billing/${billingKeyRes.billingKey}`,
      {
        method: "POST",
        headers: {
          Authorization: tossAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerKey,
          amount: plan.price,
          orderId,
          orderName,
          customerEmail: user.email,
        }),
      }
    );
    if (!res.ok) {
      const errBody = await res.text();
      console.error("[toss first charge] failed:", res.status, errBody);

      // Record failed payment for audit
      await supabaseAdmin.from("payments").insert({
        user_id: user.id,
        toss_order_id: orderId,
        amount: plan.price,
        status: "failed",
        failure_reason: errBody,
      });

      return NextResponse.json(
        { error: "FIRST_CHARGE_FAILED", detail: errBody },
        { status: 502 }
      );
    }
    chargeRes = await res.json();
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "FIRST_CHARGE_REQUEST_FAILED" },
      { status: 502 }
    );
  }

  // 4) Activate subscription
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
        cancel_at_period_end: false,
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

  // 5) Persist payment row
  await supabaseAdmin.from("payments").insert({
    user_id: user.id,
    subscription_id: sub.id,
    toss_payment_key: chargeRes.paymentKey,
    toss_order_id: chargeRes.orderId,
    amount: plan.price,
    status: "succeeded",
    paid_at: chargeRes.approvedAt ?? now.toISOString(),
    raw_response: chargeRes,
  });

  // 6) Grant monthly ink (early-access bonus is on for paid plans)
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
  });
}
