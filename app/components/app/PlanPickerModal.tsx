"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, Check, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

interface PlanPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Plan id the user is currently on, so we can disable that card. */
  currentPlan?: "free" | "pro" | "studio" | null;
}

interface PlanOption {
  id: "pro" | "studio";
  name: string;
  price: string;
  cadence: string;
  description: string;
  inkLabel: string;
  bonusLabel: string;
  features: string[];
  recommended?: boolean;
}

const OPTIONS: PlanOption[] = [
  {
    id: "pro",
    name: "Pro",
    price: "₩19,900",
    cadence: "/ 월",
    description: "1인 사업자와 작은 브랜드를 위한 표준 플랜",
    inkLabel: "매월 3,500 잉크",
    bonusLabel: "+500 얼리 액세스",
    features: [
      "페르소나 3개",
      "발행 히스토리 무제한 보관",
      "잉크 충전 할인",
    ],
    recommended: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "₩49,000",
    cadence: "/ 월",
    description: "여러 브랜드를 운영하는 에이전시·멀티브랜드 팀",
    inkLabel: "매월 10,000 잉크",
    bonusLabel: "+1,500 얼리 액세스",
    features: [
      "페르소나 10개",
      "발행 히스토리 무제한 보관",
      "잉크 충전 할인",
      "팀 멤버 초대 (곧 제공)",
    ],
  },
];

export function PlanPickerModal({
  open,
  onClose,
  currentPlan,
}: PlanPickerModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // 포털은 클라이언트에서만 (SSR 시 document 없음)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal
    >
      <div
        className="absolute inset-0 bg-ink-900/45"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-paper border border-ink-200 sm:rounded-[16px] shadow-[0_24px_64px_rgba(11,10,7,0.16)] w-full sm:max-w-[760px] max-h-[92vh] flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-ink-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-eyebrow text-anima-600 mb-0.5">Upgrade</p>
            <h2 className="font-display text-[22px] text-ink-800 tracking-[-0.02em]">
              플랜 선택
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 text-ink-400 hover:text-ink-800 transition-colors"
            aria-label="닫기"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6">
          <p className="text-[13.5px] text-ink-500 leading-[1.7] mb-6">
            플랜은 매월 잉크와 페르소나 한도를 함께 제공합니다. 카드를 한
            번 등록하면 매월 같은 날 자동으로 결제됩니다. 언제든 해지할 수
            있습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {OPTIONS.map((p) => {
              const isCurrent = currentPlan === p.id;
              const isRec = p.recommended;
              return (
                <article
                  key={p.id}
                  className={`relative rounded-[14px] border p-6 flex flex-col ${
                    isRec
                      ? "border-ink-800 bg-ink-800 text-ink-50"
                      : "border-ink-200 bg-paper text-ink-700"
                  }`}
                >
                  {isRec && (
                    <span
                      aria-hidden
                      className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-anima-300/70 to-transparent"
                    />
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`font-display text-[22px] tracking-[-0.02em] ${
                        isRec ? "text-ink-50" : "text-ink-800"
                      }`}
                    >
                      {p.name}
                    </h3>
                    {isRec && (
                      <span className="text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full bg-anima-400/20 text-anima-200 border border-anima-400/30 font-medium">
                        추천
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[12.5px] leading-[1.6] mb-5 ${
                      isRec ? "text-ink-300" : "text-ink-500"
                    }`}
                  >
                    {p.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span
                      className={`font-display tracking-[-0.025em] ${
                        isRec ? "text-ink-50" : "text-ink-800"
                      }`}
                      style={{ fontSize: 32 }}
                    >
                      {p.price}
                    </span>
                    <span
                      className={`text-[12px] ${
                        isRec ? "text-ink-300" : "text-ink-400"
                      }`}
                    >
                      {p.cadence}
                    </span>
                  </div>

                  <div
                    className={`mb-5 rounded-[8px] p-3 border ${
                      isRec
                        ? "bg-anima-300/10 border-anima-300/20"
                        : "bg-anima-50 border-anima-200"
                    }`}
                  >
                    <p
                      className={`text-[13px] font-medium mb-0.5 ${
                        isRec ? "text-anima-200" : "text-anima-700"
                      }`}
                    >
                      {p.inkLabel}
                    </p>
                    <p
                      className={`text-[11px] ${
                        isRec ? "text-anima-200/80" : "text-anima-700/80"
                      }`}
                    >
                      {p.bonusLabel}
                    </p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className={`flex items-start gap-2 text-[13px] ${
                          isRec ? "text-ink-200" : "text-ink-600"
                        }`}
                      >
                        <Check
                          size={13}
                          strokeWidth={1.75}
                          className={`mt-0.5 shrink-0 ${
                            isRec ? "text-anima-300" : "text-anima-500"
                          }`}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex">
                    {isCurrent ? (
                      <Button
                        variant="secondary"
                        size="md"
                        disabled
                      >
                        현재 플랜
                      </Button>
                    ) : (
                      <Link
                        href={`/checkout/${p.id}`}
                        onClick={onClose}
                        className="inline-flex"
                      >
                        <Button
                          variant={isRec ? "anima" : "secondary"}
                          size="md"
                          trailingIcon={
                            <ArrowRight size={13} strokeWidth={1.75} />
                          }
                        >
                          {p.name} 시작하기
                        </Button>
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-6 text-[11.5px] text-ink-400 leading-[1.6] text-center">
            모든 결제는 토스페이먼츠로 안전하게 처리됩니다. 카드 정보는
            Anima 서버에 저장되지 않으며, 언제든 해지할 수 있습니다.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
