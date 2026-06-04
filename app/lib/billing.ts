/**
 * Plan catalog + Toss helpers shared by API routes and UI.
 */

export type PlanId = "free" | "pro" | "studio";

export interface PlanDef {
  id: PlanId;
  name: string;
  price: number; // KRW, integer (VAT included)
  priceLabel: string;
  description: string;
  monthlyContent: number;
  bonusContent: number;
  personas: number;
}

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "₩0",
    description: "맛보기. 페르소나 빌더 전 기능 사용 가능.",
    monthlyContent: 10,
    bonusContent: 0,
    personas: 1,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 19900,
    priceLabel: "₩19,900",
    description: "1인 사업자와 작은 브랜드를 위한 표준 플랜.",
    monthlyContent: 50,
    bonusContent: 5, // early access bonus
    personas: 3,
  },
  studio: {
    id: "studio",
    name: "Studio",
    price: 49000,
    priceLabel: "₩49,000",
    description: "여러 브랜드를 운영하는 에이전시와 멀티브랜드 팀.",
    monthlyContent: 200,
    bonusContent: 10, // early access bonus
    personas: 10,
  },
};

export function getPlan(planId: string): PlanDef | null {
  if (planId in PLANS) return PLANS[planId as PlanId];
  return null;
}

/**
 * Generate a unique order ID for Toss. Toss requires alphanumeric +
 * underscores/dashes, 6–64 chars. We embed user + plan + timestamp so
 * we can debug from the order ID alone.
 */
export function generateOrderId(userId: string, planId: PlanId): string {
  const ts = Date.now();
  const short = userId.replace(/-/g, "").slice(0, 12);
  return `anima_${planId}_${short}_${ts}`;
}

/**
 * Generate a stable customer key for Toss. Toss requires this to be
 * unique per customer. We use the Supabase user id directly (with the
 * "anima_" prefix to avoid collision with other apps on the same Toss
 * account).
 */
export function generateCustomerKey(userId: string): string {
  return `anima_${userId.replace(/-/g, "")}`;
}

/**
 * Toss Billing API base URL.
 */
export const TOSS_API_BASE = "https://api.tosspayments.com/v1";

/**
 * Build the Authorization header for Toss server-side calls.
 * Toss expects: Basic base64(secretKey + ":")
 */
export function tossAuthHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error("TOSS_SECRET_KEY is not set");
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

/**
 * Add one month to a date, preserving the day-of-month when possible.
 * Used for renewing subscriptions on the same calendar day each month.
 */
export function addOneMonth(date: Date): Date {
  const next = new Date(date);
  const day = next.getDate();
  next.setMonth(next.getMonth() + 1);
  // If the next month doesn't have this day (e.g. Jan 31 → Feb 28),
  // setMonth will skip ahead. Roll back to the last day of the target
  // month instead.
  if (next.getDate() !== day) {
    next.setDate(0);
  }
  return next;
}
