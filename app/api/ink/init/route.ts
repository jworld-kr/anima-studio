import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { grantSubscriptionInk } from "@/app/lib/ink-server";
import type { PlanId } from "@/app/lib/billing";

/**
 * Idempotent first-time grant. Called by the dashboard on load to
 * make sure new free users have their starter ink even if they never
 * went through a paid checkout. Active subscribers also get their
 * monthly grant refilled here if it has been more than 25 days since
 * the last grant (safety net if cron is down).
 */

export async function POST(req: NextRequest) {
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

  // Determine current plan (fallback to free if no subscription)
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();
  const plan: PlanId =
    sub?.status === "active" && (sub.plan as PlanId)
      ? (sub.plan as PlanId)
      : "free";

  const result = await grantSubscriptionInk({
    userId: user.id,
    plan,
    earlyAccess: plan !== "free",
    force: false, // skip if granted in last 25 days
  });

  return NextResponse.json({ ok: true, plan, ...result });
}
