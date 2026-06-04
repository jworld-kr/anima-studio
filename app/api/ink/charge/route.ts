import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { TOSS_API_BASE, tossAuthHeader } from "@/app/lib/billing";
import { creditTopupInk } from "@/app/lib/ink-server";
import { getInkPackage, inkPriceForPlan } from "@/app/lib/ink";
import type { PlanId } from "@/app/lib/billing";

/**
 * Confirm a Toss one-shot payment for an ink topup, then credit ink
 * to the user's topup_balance.
 */

interface ChargeBody {
  paymentKey: string;
  orderId: string;
  amount: number;
  packageId: string;
}

export async function POST(req: NextRequest) {
  let body: ChargeBody;
  try {
    body = (await req.json()) as ChargeBody;
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { paymentKey, orderId, amount, packageId } = body;
  if (!paymentKey || !orderId || !amount || !packageId) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const pkg = getInkPackage(packageId);
  if (!pkg) {
    return NextResponse.json({ error: "INVALID_PACKAGE" }, { status: 400 });
  }

  const accessToken = req.headers
    .get("authorization")
    ?.replace(/^Bearer /, "");
  if (!accessToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const userClient = createClient(supabaseUrl, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Resolve the user's plan (service role bypasses RLS) and validate the
  // charged amount against the plan-discounted price. This prevents a
  // client from paying the discounted price without an active plan.
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();
  const plan: PlanId =
    sub && sub.status === "active" ? (sub.plan as PlanId) ?? "free" : "free";
  const expectedAmount = inkPriceForPlan(pkg.price, plan);

  if (amount !== expectedAmount) {
    return NextResponse.json(
      { error: "AMOUNT_MISMATCH", expected: expectedAmount, got: amount },
      { status: 400 }
    );
  }

  // Confirm with Toss
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
      console.error("[ink topup confirm] failed:", res.status, errBody);
      await supabaseAdmin.from("ink_topup_orders").insert({
        user_id: user.id,
        package_id: packageId,
        toss_order_id: orderId,
        toss_payment_key: paymentKey,
        amount,
        ink_amount: pkg.totalInk,
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

  // Persist order + credit ink
  const { data: order, error: orderErr } = await supabaseAdmin
    .from("ink_topup_orders")
    .insert({
      user_id: user.id,
      package_id: packageId,
      toss_order_id: confirmRes.orderId,
      toss_payment_key: confirmRes.paymentKey,
      amount,
      ink_amount: pkg.totalInk,
      status: "succeeded",
      paid_at: confirmRes.approvedAt ?? new Date().toISOString(),
      raw_response: confirmRes,
    })
    .select()
    .single();

  if (orderErr || !order) {
    console.error(orderErr);
    return NextResponse.json(
      { error: "DB_ORDER_SAVE_FAILED" },
      { status: 500 }
    );
  }

  await creditTopupInk({
    userId: user.id,
    amount: pkg.totalInk,
    referenceId: order.id,
    packageId,
  });

  return NextResponse.json({
    ok: true,
    inkCredited: pkg.totalInk,
    packageName: pkg.name,
  });
}
