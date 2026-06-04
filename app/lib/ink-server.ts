/**
 * Server-side ink balance operations. Uses the Supabase service-role
 * client. Never import this from client components.
 */

import { supabaseAdmin } from "./supabase-admin";
import { INK_COSTS, InkAction, PLAN_INK_GRANT } from "./ink";
import type { PlanId } from "./billing";

interface BalanceRow {
  user_id: string;
  subscription_balance: number;
  topup_balance: number;
}

/**
 * Get or create the ink balance row for a user.
 */
async function ensureBalance(userId: string): Promise<BalanceRow> {
  const { data, error } = await supabaseAdmin
    .from("ink_balances")
    .select("user_id, subscription_balance, topup_balance")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as BalanceRow;

  // First-time user: create row with zero balances. New free users get
  // their first grant when grantSubscriptionInk runs (called on signup
  // or first dashboard visit).
  const { data: created, error: insErr } = await supabaseAdmin
    .from("ink_balances")
    .insert({ user_id: userId })
    .select("user_id, subscription_balance, topup_balance")
    .single();
  if (insErr) throw insErr;
  return created as BalanceRow;
}

export async function getBalance(
  userId: string
): Promise<{ subscription: number; topup: number; total: number }> {
  const row = await ensureBalance(userId);
  return {
    subscription: row.subscription_balance,
    topup: row.topup_balance,
    total: row.subscription_balance + row.topup_balance,
  };
}

/**
 * Deduct ink for an action. Spends subscription_balance first, then
 * topup_balance. Throws if total balance is insufficient.
 */
export async function spendInk(opts: {
  userId: string;
  action: InkAction;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<{
  spent: number;
  remaining: { subscription: number; topup: number; total: number };
}> {
  const { userId, action, referenceId, metadata } = opts;
  const cost = INK_COSTS[action];
  if (cost === 0) {
    const remaining = await getBalance(userId);
    return { spent: 0, remaining };
  }

  const row = await ensureBalance(userId);
  const total = row.subscription_balance + row.topup_balance;
  if (total < cost) {
    const err = new Error("INSUFFICIENT_INK");
    (err as Error & { code: string }).code = "INSUFFICIENT_INK";
    throw err;
  }

  // Spend subscription bucket first
  const fromSubscription = Math.min(row.subscription_balance, cost);
  const fromTopup = cost - fromSubscription;

  const newSubscription = row.subscription_balance - fromSubscription;
  const newTopup = row.topup_balance - fromTopup;
  const balanceAfter = newSubscription + newTopup;

  const { error: updErr } = await supabaseAdmin
    .from("ink_balances")
    .update({
      subscription_balance: newSubscription,
      topup_balance: newTopup,
    })
    .eq("user_id", userId);
  if (updErr) throw updErr;

  // Audit log — one row per bucket touched.
  const txRows: Array<Record<string, unknown>> = [];
  if (fromSubscription > 0) {
    txRows.push({
      user_id: userId,
      kind: "spend",
      amount: -fromSubscription,
      bucket: "subscription",
      action,
      reference_id: referenceId ?? null,
      metadata: metadata ?? null,
      balance_after: balanceAfter,
    });
  }
  if (fromTopup > 0) {
    txRows.push({
      user_id: userId,
      kind: "spend",
      amount: -fromTopup,
      bucket: "topup",
      action,
      reference_id: referenceId ?? null,
      metadata: metadata ?? null,
      balance_after: balanceAfter,
    });
  }
  if (txRows.length > 0) {
    await supabaseAdmin.from("ink_transactions").insert(txRows);
  }

  return {
    spent: cost,
    remaining: {
      subscription: newSubscription,
      topup: newTopup,
      total: balanceAfter,
    },
  };
}

/**
 * Refund ink that was spent (e.g. AI generation failed mid-way).
 * Always refunds to the topup bucket so the user doesn't lose lifetime
 * value when a refund crosses a billing boundary.
 */
export async function refundInk(opts: {
  userId: string;
  amount: number;
  action?: InkAction;
  referenceId?: string;
}): Promise<void> {
  const { userId, amount, action, referenceId } = opts;
  if (amount <= 0) return;

  const row = await ensureBalance(userId);
  const newTopup = row.topup_balance + amount;
  const balanceAfter = row.subscription_balance + newTopup;

  await supabaseAdmin
    .from("ink_balances")
    .update({ topup_balance: newTopup })
    .eq("user_id", userId);

  await supabaseAdmin.from("ink_transactions").insert({
    user_id: userId,
    kind: "refund",
    amount,
    bucket: "topup",
    action: action ?? null,
    reference_id: referenceId ?? null,
    balance_after: balanceAfter,
  });
}

/**
 * Grant the monthly subscription ink for a plan. Replaces the current
 * subscription_balance (does NOT add — old monthly ink is forfeited
 * when the new month starts). Topup balance is untouched.
 *
 * Called on:
 *   * user signup (gives Free plan ink)
 *   * subscription renewal (cron in /api/billing/charge)
 *   * plan upgrade
 *
 * If `force` is false, the grant is skipped when the user has already
 * received this month's grant within the last 25 days (idempotency
 * guard for callers like dashboard auto-grant).
 */
export async function grantSubscriptionInk(opts: {
  userId: string;
  plan: PlanId;
  earlyAccess?: boolean;
  force?: boolean;
  referenceId?: string;
}): Promise<{ granted: number; skipped: boolean }> {
  const { userId, plan, earlyAccess = false, force = false, referenceId } = opts;
  const grant = PLAN_INK_GRANT[plan];
  const total = grant.base + (earlyAccess ? grant.earlyBonus : 0);

  const row = await ensureBalance(userId);

  // Idempotency: skip if granted in the last 25 days unless `force`
  if (!force) {
    const { data: existing } = await supabaseAdmin
      .from("ink_balances")
      .select("last_subscription_grant_at")
      .eq("user_id", userId)
      .single();
    const last = existing?.last_subscription_grant_at
      ? new Date(existing.last_subscription_grant_at)
      : null;
    if (
      last &&
      Date.now() - last.getTime() < 25 * 24 * 60 * 60 * 1000
    ) {
      return { granted: 0, skipped: true };
    }
  }

  const balanceAfter = total + row.topup_balance;
  await supabaseAdmin
    .from("ink_balances")
    .update({
      subscription_balance: total,
      last_subscription_grant_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  await supabaseAdmin.from("ink_transactions").insert({
    user_id: userId,
    kind: "subscription_grant",
    amount: total,
    bucket: "subscription",
    action: null,
    reference_id: referenceId ?? null,
    metadata: { plan, earlyAccess, base: grant.base, earlyBonus: grant.earlyBonus },
    balance_after: balanceAfter,
  });

  return { granted: total, skipped: false };
}

/**
 * Credit ink from a successful topup payment.
 */
export async function creditTopupInk(opts: {
  userId: string;
  amount: number;
  referenceId: string;
  packageId: string;
}): Promise<void> {
  const { userId, amount, referenceId, packageId } = opts;
  if (amount <= 0) return;

  const row = await ensureBalance(userId);
  const newTopup = row.topup_balance + amount;
  const balanceAfter = row.subscription_balance + newTopup;

  await supabaseAdmin
    .from("ink_balances")
    .update({ topup_balance: newTopup })
    .eq("user_id", userId);

  await supabaseAdmin.from("ink_transactions").insert({
    user_id: userId,
    kind: "topup",
    amount,
    bucket: "topup",
    action: null,
    reference_id: referenceId,
    metadata: { packageId },
    balance_after: balanceAfter,
  });
}
