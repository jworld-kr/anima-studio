import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

/**
 * Cancel subscription.
 *
 * We don't charge a refund here — that's handled manually per the
 * /refund policy. We just flip cancel_at_period_end so the cron worker
 * stops renewing. The user keeps access until current_period_end.
 */

export async function POST(req: NextRequest) {
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

  const { data: sub, error: subErr } = await supabaseAdmin
    .from("subscriptions")
    .update({
      cancel_at_period_end: true,
      cancelled_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("status", "active")
    .select()
    .single();

  if (subErr || !sub) {
    console.error(subErr);
    return NextResponse.json(
      { error: "SUBSCRIPTION_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    cancelAtPeriodEnd: sub.current_period_end,
  });
}
