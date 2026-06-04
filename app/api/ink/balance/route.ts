import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBalance } from "@/app/lib/ink-server";

export async function GET(req: NextRequest) {
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

  try {
    const balance = await getBalance(user.id);
    return NextResponse.json({ ok: true, balance });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "BALANCE_FAILED" }, { status: 500 });
  }
}
