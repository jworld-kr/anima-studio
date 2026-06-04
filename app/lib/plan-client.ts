/**
 * Client-side helper to read the logged-in user's current plan.
 * Reads the subscriptions table directly (RLS scopes it to the user).
 */
import { supabase } from "./supabase";
import type { PlanId } from "./billing";

/** History retention per plan, in days. null = unlimited. */
export const HISTORY_RETENTION_DAYS: Record<PlanId, number | null> = {
  free: 30,
  pro: null,
  studio: null,
};

/**
 * Returns the user's active plan, or "free" if none / not active.
 */
export async function getCurrentPlan(): Promise<PlanId> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return "free";

  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!data || data.status !== "active") return "free";
  return (data.plan as PlanId) ?? "free";
}
