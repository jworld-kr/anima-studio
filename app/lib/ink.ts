/**
 * Ink (credit) catalog and helpers.
 *
 * Costs and grants are defined here so both UI and API stay in sync.
 * Server-side balance mutations live in app/lib/ink-server.ts and use
 * the service-role Supabase client.
 */

import type { PlanId } from "./billing";

export const INK_COSTS = {
  /** Generate 10 topic candidates */
  topic_generation: 30,
  /** Generate the full thread (3–10 posts) */
  content_generation: 100,
  /** Re-roll the same topic (50% of content_generation) */
  content_regeneration: 50,
  /** Publishing is free — Anima just opens the Threads composer */
  publish: 0,
} as const;

export type InkAction = keyof typeof INK_COSTS;

/**
 * Monthly ink granted at every subscription renewal. The early-access
 * bonus is added on top while the user remains on the plan.
 */
export const PLAN_INK_GRANT: Record<PlanId, { base: number; earlyBonus: number }> = {
  free: { base: 700, earlyBonus: 0 },
  pro: { base: 3500, earlyBonus: 500 },
  studio: { base: 10000, earlyBonus: 1500 },
};

/**
 * One-time topup packages.
 */
export interface InkPackage {
  id: "ink_small" | "ink_regular" | "ink_large";
  name: string;
  price: number; // KRW, integer
  priceLabel: string;
  baseInk: number;
  bonusInk: number;
  totalInk: number;
  bonusPercent: number;
}

export const INK_PACKAGES: InkPackage[] = [
  {
    id: "ink_small",
    name: "작은 잉크병",
    price: 4900,
    priceLabel: "₩4,900",
    baseInk: 600,
    bonusInk: 0,
    totalInk: 600,
    bonusPercent: 0,
  },
  {
    id: "ink_regular",
    name: "일반 잉크병",
    price: 9900,
    priceLabel: "₩9,900",
    baseInk: 1200,
    bonusInk: 300,
    totalInk: 1500,
    bonusPercent: 25,
  },
  {
    id: "ink_large",
    name: "큰 잉크병",
    price: 29900,
    priceLabel: "₩29,900",
    baseInk: 3600,
    bonusInk: 1400,
    totalInk: 5000,
    bonusPercent: 39,
  },
];

export function getInkPackage(id: string): InkPackage | null {
  return INK_PACKAGES.find((p) => p.id === id) ?? null;
}

/**
 * Ink top-up discount rate per plan. Paid plans pay less for the same
 * ink package. Pure data so both client and server can use it.
 */
export const INK_TOPUP_DISCOUNT: Record<PlanId, number> = {
  free: 0,
  pro: 0.1,
  studio: 0.2,
};

/**
 * Final charge amount for an ink package given the user's plan.
 * Rounds to the nearest ₩10 to keep prices clean. Pure + deterministic
 * so the checkout page and the charge API always agree.
 */
export function inkPriceForPlan(basePrice: number, plan: PlanId): number {
  const rate = INK_TOPUP_DISCOUNT[plan] ?? 0;
  if (rate <= 0) return basePrice;
  const discounted = basePrice * (1 - rate);
  return Math.round(discounted / 10) * 10;
}

export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function actionLabel(action: InkAction): string {
  switch (action) {
    case "topic_generation":
      return "주제 생성";
    case "content_generation":
      return "콘텐츠 생성";
    case "content_regeneration":
      return "콘텐츠 재생성";
    case "publish":
      return "발행";
  }
}

/**
 * Generate a unique order ID for an ink topup. Same shape as billing
 * but with an "ink_" prefix so the two flows are easy to grep apart.
 */
export function generateInkOrderId(
  userId: string,
  packageId: InkPackage["id"]
): string {
  const ts = Date.now();
  const short = userId.replace(/-/g, "").slice(0, 12);
  return `ink_${packageId}_${short}_${ts}`;
}
