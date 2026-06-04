import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { limitForPlan } from "@/app/lib/persona-limit";
import type { PlanId } from "@/app/lib/billing";
import type { Channel } from "@/app/types";

async function getAuthedUser(req: NextRequest) {
  const accessToken = req.headers
    .get("authorization")
    ?.replace(/^Bearer /, "");
  if (!accessToken) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const userClient = createClient(supabaseUrl, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  return user;
}

async function getPlanForUser(userId: string): Promise<PlanId> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return "free";
  if (data.status !== "active") return "free";
  return (data.plan as PlanId) ?? "free";
}

async function countPersonas(userEmail: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from("channels")
    .select("id", { count: "exact", head: true })
    .eq("user_email", userEmail);
  return count ?? 0;
}

/**
 * GET /api/channels
 * Returns the user's current persona count + plan limit.
 * Used by the UI to gate the "new persona" button.
 */
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user?.email) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const plan = await getPlanForUser(user.id);
    const limit = limitForPlan(plan);
    const count = await countPersonas(user.email);
    return NextResponse.json({
      ok: true,
      plan,
      limit,
      count,
      canCreate: count < limit,
    });
  } catch (e) {
    console.error("channels GET failed:", e);
    return NextResponse.json({ error: "QUERY_FAILED" }, { status: 500 });
  }
}

/**
 * POST /api/channels
 * Body: { channel: Channel }
 * Creates a persona, enforcing plan limit at the application AND DB layer.
 */
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user?.email) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const channel: Channel | undefined = body?.channel;
  if (!channel || !channel.id || !channel.name?.trim()) {
    return NextResponse.json({ error: "INVALID_CHANNEL" }, { status: 400 });
  }

  try {
    const plan = await getPlanForUser(user.id);
    const limit = limitForPlan(plan);
    const count = await countPersonas(user.email);
    if (count >= limit) {
      return NextResponse.json(
        {
          error: "PERSONA_LIMIT",
          plan,
          limit,
          count,
        },
        { status: 403 }
      );
    }

    const { error: insErr } = await supabaseAdmin.from("channels").insert({
      id: channel.id,
      user_email: user.email,
      name: channel.name,
      thumbnail: channel.thumbnail,
      active_categories: channel.activeCategories,
      world_building: channel.worldBuilding,
      created_at: channel.createdAt,
    });

    if (insErr) {
      // DB trigger fires P0001 with "PERSONA_LIMIT:" prefix as a last
      // line of defense (race conditions, direct client inserts, etc.).
      if (insErr.message?.startsWith("PERSONA_LIMIT")) {
        return NextResponse.json(
          { error: "PERSONA_LIMIT", plan, limit, count },
          { status: 403 }
        );
      }
      console.error("channel insert failed:", insErr);
      return NextResponse.json(
        { error: "INSERT_FAILED", detail: insErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, channel });
  } catch (e) {
    console.error("channels POST failed:", e);
    return NextResponse.json({ error: "CREATE_FAILED" }, { status: 500 });
  }
}
