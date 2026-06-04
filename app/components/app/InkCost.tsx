"use client";

import { InkIcon } from "../brand/InkIcon";

interface InkCostProps {
  /** Number of ink units this action will spend */
  cost: number;
  /** Whether the user can afford it. If false, badge turns into a warning. */
  insufficient?: boolean;
  /** When inside a primary (dark) button, render lighter colors. */
  onDark?: boolean;
  className?: string;
}

/**
 * Compact ink cost pill placed inside an action button (or beside it).
 * Visually communicates "this action costs N ink" without competing
 * with the button's main label.
 *
 * Variants:
 *   - default     : subtle anima sage chip
 *   - onDark      : lighter chip for use on ink-800 buttons
 *   - insufficient: warning chip (yellow) when user can't afford
 */
export function InkCost({
  cost,
  insufficient = false,
  onDark = false,
  className = "",
}: InkCostProps) {
  const cls = insufficient
    ? "bg-[rgba(201,169,97,0.18)] text-[#7a6428] border-[rgba(201,169,97,0.45)]"
    : onDark
    ? "bg-anima-300/15 text-anima-200 border-anima-300/30"
    : "bg-anima-50 text-anima-700 border-anima-200";

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] border text-[10.5px] font-mono tabular-nums tracking-[0.01em] font-medium ${cls} ${className}`}
      aria-label={`${cost} 잉크 ${insufficient ? "부족" : "차감"}`}
    >
      <InkIcon size={9} />
      {cost.toLocaleString()}
    </span>
  );
}
