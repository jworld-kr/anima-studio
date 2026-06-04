import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

/**
 * Toss webhook receiver.
 *
 * Handles out-of-band events from Toss — most importantly refunds and
 * payment cancellations made via the Toss console. We update our local
 * payments / subscriptions tables accordingly.
 *
 * Toss event types we care about:
 *   - PAYMENT_STATUS_CHANGED  (status: CANCELED, PARTIAL_CANCELED, ...)
 */

export async function POST(req: NextRequest) {
  // Toss includes a signature in production; verify if configured.
  // (Test environment may not send a signature.)
  const signature = req.headers.get("toss-signature");
  const secret = process.env.TOSS_WEBHOOK_SECRET;
  const rawBody = await req.text();

  if (secret && signature) {
    const expected = await hmacSha256Base64(secret, rawBody);
    if (expected !== signature) {
      return NextResponse.json(
        { error: "INVALID_SIGNATURE" },
        { status: 401 }
      );
    }
  }

  let event: {
    eventType?: string;
    data?: {
      paymentKey?: string;
      orderId?: string;
      status?: string;
      cancels?: Array<{ cancelAmount: number; canceledAt: string }>;
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  if (event.eventType === "PAYMENT_STATUS_CHANGED" && event.data) {
    const { orderId, status } = event.data;
    if (!orderId) {
      return NextResponse.json({ ok: true, ignored: "NO_ORDER_ID" });
    }

    // Map Toss status → our status
    let nextStatus: "succeeded" | "failed" | "cancelled" | "refunded" | null =
      null;
    switch (status) {
      case "CANCELED":
        nextStatus = "cancelled";
        break;
      case "PARTIAL_CANCELED":
        nextStatus = "refunded";
        break;
      case "ABORTED":
      case "EXPIRED":
        nextStatus = "failed";
        break;
      default:
        nextStatus = null;
    }

    if (nextStatus) {
      await supabaseAdmin
        .from("payments")
        .update({ status: nextStatus, raw_response: event.data })
        .eq("toss_order_id", orderId);

      // If the most recent payment was refunded/cancelled, downgrade
      // the related subscription to free.
      if (nextStatus === "cancelled" || nextStatus === "refunded") {
        const { data: pay } = await supabaseAdmin
          .from("payments")
          .select("user_id, subscription_id")
          .eq("toss_order_id", orderId)
          .single();
        if (pay?.subscription_id) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "expired",
              plan: "free",
              cancel_at_period_end: false,
              cancelled_at: new Date().toISOString(),
            })
            .eq("id", pay.subscription_id);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}

async function hmacSha256Base64(
  secret: string,
  message: string
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Buffer.from(sig).toString("base64");
}
