"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, ArrowRight, AlertCircle } from "lucide-react";
import { InkBottle, InkIcon } from "../brand/InkIcon";
import { Button } from "../ui/Button";
import { INK_PACKAGES } from "@/app/lib/ink";
import { useInk } from "./InkContext";

/**
 * Modal that pops when an action requires more ink than the user has.
 * Shows current balance + the three top-up packages. Each package
 * routes to /ink/checkout/[pkg] for the actual payment.
 */
export function InkTopupModal() {
  const { _topupRequired, _dismissTopup, balance } = useInk();
  const open = _topupRequired !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") _dismissTopup();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, _dismissTopup]);

  if (!open) return null;

  const total = balance?.total ?? 0;
  const required = _topupRequired ?? 0;
  const shortBy = Math.max(required - total, 0);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal
    >
      <div
        className="absolute inset-0 bg-ink-900/45"
        onClick={_dismissTopup}
        aria-hidden
      />
      <div className="relative bg-paper border border-ink-200 sm:rounded-[16px] shadow-[0_24px_64px_rgba(11,10,7,0.16)] w-full sm:max-w-[640px] max-h-[92vh] flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-ink-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-eyebrow text-ink-400 mb-0.5">Out of ink</p>
            <h2 className="font-display text-[20px] text-ink-800 tracking-[-0.02em]">
              잉크 충전
            </h2>
          </div>
          <button
            onClick={_dismissTopup}
            className="p-1.5 -mr-1.5 text-ink-400 hover:text-ink-800 transition-colors"
            aria-label="닫기"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </header>

        {/* Status */}
        {required > 0 && (
          <div className="px-6 py-4 border-b border-ink-200 bg-[rgba(201,169,97,0.08)] flex items-start gap-2.5">
            <AlertCircle
              size={14}
              strokeWidth={1.75}
              className="text-[#7a6428] mt-0.5 shrink-0"
            />
            <div className="text-[12.5px] text-[#7a6428] leading-[1.6]">
              <p className="font-medium">잉크가 부족해요.</p>
              <p className="mt-0.5">
                필요한 잉크 <span className="tabular-nums">{required.toLocaleString()}</span>,
                현재 잔액 <span className="tabular-nums">{total.toLocaleString()}</span>{" "}
                — 최소 <span className="tabular-nums">{shortBy.toLocaleString()}</span>{" "}
                잉크 더 필요합니다.
              </p>
            </div>
          </div>
        )}

        {/* Packages */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {INK_PACKAGES.map((p) => {
              const isMid = p.id === "ink_regular";
              return (
                <Link
                  key={p.id}
                  href={`/ink/checkout/${p.id}`}
                  className={`group relative rounded-[14px] border p-5 transition-colors flex flex-col text-left ${
                    isMid
                      ? "border-ink-800 bg-ink-800 text-ink-50"
                      : "border-ink-200 bg-paper hover:border-ink-300"
                  }`}
                >
                  {isMid && (
                    <span className="absolute -top-px left-5 right-5 h-px bg-gradient-to-r from-transparent via-anima-300/70 to-transparent" />
                  )}
                  <div
                    className={`mb-3 h-[64px] flex items-end ${
                      isMid ? "text-anima-200" : "text-anima-500"
                    }`}
                  >
                    <InkBottle
                      size={
                        p.id === "ink_small"
                          ? "small"
                          : p.id === "ink_large"
                          ? "large"
                          : "regular"
                      }
                    />
                  </div>
                  <p
                    className={`font-display text-[16px] tracking-[-0.015em] mb-1 ${
                      isMid ? "text-ink-50" : "text-ink-800"
                    }`}
                  >
                    {p.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <p
                      className={`font-mono tabular-nums tracking-[-0.025em] ${
                        isMid ? "text-ink-50" : "text-ink-800"
                      }`}
                      style={{ fontSize: 22, fontWeight: 500 }}
                    >
                      {p.totalInk.toLocaleString()}
                    </p>
                    <span
                      className={`text-[11px] ${
                        isMid ? "text-ink-300" : "text-ink-500"
                      }`}
                    >
                      잉크
                    </span>
                  </div>
                  {p.bonusPercent > 0 && (
                    <p
                      className={`text-[11px] mb-3 ${
                        isMid ? "text-anima-200" : "text-anima-700"
                      }`}
                    >
                      +{p.bonusPercent}% 보너스
                    </p>
                  )}
                  <div className="mt-auto pt-3 border-t border-current/10 flex items-baseline justify-between">
                    <p
                      className={`font-display tracking-[-0.02em] ${
                        isMid ? "text-ink-50" : "text-ink-800"
                      }`}
                      style={{ fontSize: 18 }}
                    >
                      {p.priceLabel}
                    </p>
                    <ArrowRight
                      size={13}
                      strokeWidth={1.75}
                      className={
                        isMid ? "text-anima-200" : "text-ink-500"
                      }
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="mt-5 text-[11.5px] text-ink-400 leading-[1.55] text-center">
            필요한 양만큼, 추가로 충전 후 사용할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
