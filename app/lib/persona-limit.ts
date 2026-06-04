/**
 * Per-plan persona (channel) limits. Mirrors the DB trigger in
 * supabase/migrations/20260509_persona_limit.sql — keep them in sync.
 */
import type { PlanId } from "./billing";

export const PERSONA_LIMITS: Record<PlanId, number> = {
  free: 1,
  pro: 3,
  studio: 10,
};

export function limitForPlan(plan: PlanId | null | undefined): number {
  if (!plan) return PERSONA_LIMITS.free;
  return PERSONA_LIMITS[plan] ?? PERSONA_LIMITS.free;
}
