import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateThreadPosts } from "@/app/lib/claude";
import { WorldBuilding } from "@/app/types";
import { getBalance, refundInk, spendInk } from "@/app/lib/ink-server";
import { INK_COSTS } from "@/app/lib/ink";

export async function POST(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────
  const accessToken = request.headers
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

  // ── Parse ────────────────────────────────────────────────
  let body: {
    worldBuilding?: WorldBuilding;
    topic?: string;
    selectedHook?: string;
    length?: number;
    regenerate?: boolean;
    shape?: string;
    purposeBrief?: string;
    minChars?: number;
    maxChars?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const {
    worldBuilding,
    topic,
    selectedHook,
    length,
    regenerate,
    shape,
    purposeBrief,
    minChars,
    maxChars,
  } = body;
  if (!worldBuilding || !topic || !selectedHook || !length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // ── Spend ink up-front (50% off for regeneration) ────────
  const action = regenerate
    ? ("content_regeneration" as const)
    : ("content_generation" as const);
  const cost = INK_COSTS[action];
  try {
    await spendInk({ userId: user.id, action });
  } catch (e) {
    if ((e as Error & { code?: string }).code === "INSUFFICIENT_INK") {
      const balance = await getBalance(user.id);
      return NextResponse.json(
        {
          error: "INSUFFICIENT_INK",
          required: cost,
          balance: balance.total,
        },
        { status: 402 }
      );
    }
    throw e;
  }

  // ── Call AI; refund if it fails ──────────────────────────
  try {
    const posts = await generateThreadPosts(
      worldBuilding,
      topic,
      selectedHook,
      length,
      { shape, purposeBrief, minChars, maxChars }
    );
    const balance = await getBalance(user.id);
    return NextResponse.json({ posts, ink: { spent: cost, ...balance } });
  } catch (error) {
    console.error("Error generating posts:", error);
    await refundInk({ userId: user.id, amount: cost, action }).catch(
      (e) => console.error("[ink refund failed]", e)
    );
    return NextResponse.json(
      { error: "Failed to generate posts" },
      { status: 500 }
    );
  }
}
