"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { InkIcon } from "../brand/InkIcon";
import { useInk } from "./InkContext";

/**
 * Compact ink balance display for the sidebar bottom area.
 * Click → /settings/billing for top-up.
 */
export function InkPill() {
  const { balance, loading } = useInk();

  if (loading) {
    return (
      <div className="px-3 py-2.5 rounded-[8px] bg-ink-50 border border-ink-200/60">
        <div className="h-3 w-16 rounded bg-ink-200 animate-pulse" />
      </div>
    );
  }

  const total = balance?.total ?? 0;
  const isLow = total < 130;

  return (
    <Link
      href="/settings/billing"
      className={`group block px-3 py-2.5 rounded-[8px] border transition-colors ${
        isLow
          ? "bg-[rgba(201,169,97,0.08)] border-[rgba(201,169,97,0.30)] hover:border-[rgba(201,169,97,0.50)]"
          : "bg-ink-50/60 border-ink-200/60 hover:border-ink-300 hover:bg-ink-100/60"
      }`}
      aria-label="잉크 충전 페이지로"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <InkIcon
            size={14}
            className={isLow ? "text-[#7a6428]" : "text-anima-500"}
          />
          <p className="text-[10px] text-ink-400 tracking-[0.08em] uppercase font-medium">
            Ink
          </p>
        </div>
        <Plus
          size={12}
          strokeWidth={1.75}
          className="text-ink-400 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <p
        className={`mt-1 font-mono tabular-nums tracking-[-0.01em] ${
          isLow ? "text-[#7a6428]" : "text-ink-800"
        }`}
        style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.1 }}
      >
        {total.toLocaleString()}
      </p>
      {isLow && (
        <p className="mt-1 text-[10.5px] text-[#7a6428] leading-[1.4]">
          잉크가 부족해요. 충전해두세요.
        </p>
      )}
    </Link>
  );
}
