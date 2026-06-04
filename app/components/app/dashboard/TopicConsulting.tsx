"use client";

import { useEffect, useState, Fragment, type ReactNode } from "react";
import { X, BookOpen } from "lucide-react";
import {
  GUIDE_INTRO,
  GUIDE_WHY_HEADING,
  GUIDE_WHY,
  GUIDE_STEPS_HEADING,
  GUIDE_STEPS_INTRO,
  GUIDE_STEPS,
  GUIDE_TIP_TITLE,
  GUIDE_TIP_BODY,
  GUIDE_EXAMPLES,
  GUIDE_IO_HEADING,
  GUIDE_IO_ROWS,
  GUIDE_OUTRO_LABEL,
  GUIDE_OUTRO,
} from "@/app/lib/guidebook";

/**
 * 본문에서 highlights 문구를 찾아 굵게 렌더한다.
 * 마크업 기호 없이 데이터의 highlight 목록만으로 강조 처리.
 */
function withHighlights(text: string, highlights?: string[]): ReactNode {
  if (!highlights || highlights.length === 0) return text;
  const sorted = [...highlights].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `(${sorted
      .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})`,
    "g"
  );
  return text.split(pattern).map((part, i) =>
    highlights.includes(part) ? (
      <strong key={i} className="font-semibold text-ink-800">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

/**
 * "Anima 가이드북" — 앱 사용 설명서 모달. 읽기 전용.
 * 콘텐츠 작성 화면에서 버튼으로 열린다.
 */
export function TopicConsulting() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 hover:text-ink-800 transition-colors"
      >
        <BookOpen size={13} strokeWidth={1.75} />
        Anima 가이드북
      </button>

      {open && <GuidebookModal onClose={() => setOpen(false)} />}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function GuidebookModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal
    >
      <div
        className="absolute inset-0 bg-ink-900/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-paper border border-ink-200 rounded-t-[18px] sm:rounded-[18px] shadow-[0_24px_64px_rgba(11,10,7,0.18)] w-full sm:max-w-[640px] max-h-[90dvh] sm:max-h-[92vh] flex flex-col animate-slide-up overflow-hidden break-keep">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 text-ink-400 hover:text-ink-800 transition-colors"
          aria-label="닫기"
        >
          <X size={16} strokeWidth={1.75} />
        </button>

        <div className="flex-1 overflow-y-auto">
          {/* ── 1. 환영 ── */}
          <section className="px-7 sm:px-9 pt-9 pb-8 border-b border-ink-200 bg-gradient-to-b from-anima-50/60 to-transparent">
            <p className="text-eyebrow text-anima-600 mb-3">
              {GUIDE_INTRO.eyebrow}
            </p>
            <h2 className="font-display text-[20px] text-ink-800 tracking-[-0.015em] leading-[1.4] mb-4">
              <span className="text-ink-400 mr-1.5">{GUIDE_INTRO.sectionNo}</span>
              {GUIDE_INTRO.welcome}
            </h2>
            <p className="font-display text-[16px] text-anima-700 leading-[1.5] mb-4 italic">
              “{GUIDE_INTRO.quote}”
            </p>
            <p className="text-[13.5px] text-ink-600 leading-[1.8]">
              {withHighlights(GUIDE_INTRO.body, GUIDE_INTRO.highlights)}
            </p>
          </section>

          {/* ── 왜 다를까요 ── */}
          <section className="px-7 sm:px-9 py-8 border-b border-ink-200">
            <h3 className="font-display text-[17px] text-ink-800 tracking-[-0.01em] mb-5">
              {GUIDE_WHY_HEADING}
            </h3>
            <div className="space-y-4">
              {GUIDE_WHY.map((w) => (
                <div
                  key={w.title}
                  className="rounded-[12px] border border-ink-200 bg-ink-50/40 px-4 py-4"
                >
                  <h4 className="text-[14px] font-semibold text-ink-800 mb-1.5">
                    {w.title}
                  </h4>
                  <p className="text-[13px] text-ink-600 leading-[1.8]">
                    {withHighlights(w.body, w.highlights)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 2. 4단계 사용법 ── */}
          <section className="px-7 sm:px-9 py-8">
            <h3 className="font-display text-[17px] text-ink-800 tracking-[-0.01em] mb-1.5">
              <span className="text-ink-400 mr-1.5">2.</span>
              {GUIDE_STEPS_HEADING}
            </h3>
            <p className="text-[13px] text-ink-500 leading-[1.7] mb-7">
              {GUIDE_STEPS_INTRO}
            </p>

            <ol className="space-y-4">
              {GUIDE_STEPS.map((step, si) => (
                <li
                  key={step.index}
                  className="rounded-[14px] border border-ink-200 bg-paper px-5 py-5"
                >
                  {/* 단계 헤더 */}
                  <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-ink-100">
                    <span className="w-7 h-7 rounded-full bg-ink-800 text-ink-50 flex items-center justify-center text-[13px] font-semibold tabular-nums shrink-0">
                      {si + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-semibold text-ink-800 leading-tight">
                        {step.title}
                      </h4>
                      <span className="text-[11.5px] text-ink-400">
                        {step.paren}
                      </span>
                    </div>
                  </div>

                  {/* 리드 문단 */}
                  <p className="text-[13px] text-ink-600 leading-[1.8] mb-3">
                    {withHighlights(step.lead, step.leadHighlights)}
                  </p>

                  {/* 소제목 항목들 */}
                  {step.items.length > 0 && (
                    <ul className="space-y-2 mb-1">
                      {step.items.map((it) => (
                        <li
                          key={it.label}
                          className="text-[13px] leading-[1.8]"
                        >
                          <span className="font-semibold text-ink-800">
                            {it.label}:
                          </span>{" "}
                          <span className="text-ink-600">
                            {withHighlights(it.body, it.highlights)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* 2단계 전용 — 팁 + 예시 + IO 테이블 */}
                  {step.index === "2단계" && (
                    <div className="mt-4 space-y-4">
                      {/* 핵심 팁 */}
                      <div className="rounded-[12px] border border-anima-200 bg-anima-50 px-4 py-4">
                        <p className="text-[13px] font-semibold text-anima-700 leading-[1.6] mb-2">
                          {GUIDE_TIP_TITLE}
                        </p>
                        <p className="text-[12.5px] text-anima-700/85 leading-[1.7]">
                          {GUIDE_TIP_BODY}
                        </p>
                      </div>

                      {/* 유형별 예시 */}
                      {GUIDE_EXAMPLES.map((group) => (
                        <div
                          key={group.label}
                          className="rounded-[12px] border border-ink-200 bg-ink-50/40 p-4"
                        >
                          <div className="flex items-baseline gap-2 mb-3.5">
                            <span className="text-[14px]">{group.emoji}</span>
                            <span className="text-[13.5px] font-semibold text-ink-800">
                              {group.label}
                            </span>
                            <span className="text-[11px] text-ink-400">
                              ({group.caption})
                            </span>
                          </div>
                          <ul className="space-y-4">
                            {group.items.map((ex) => (
                              <li key={ex.input}>
                                <div className="text-[12.5px] leading-[1.6] mb-1.5">
                                  <span className="text-ink-400">
                                    {ex.inputLabel} 입력:{" "}
                                  </span>
                                  <span className="text-ink-800 font-semibold">
                                    {ex.input}
                                  </span>
                                </div>
                                <div className="flex gap-1.5">
                                  <span className="text-[12px] shrink-0 pt-[1px]">
                                    🪄
                                  </span>
                                  <p className="text-[12.5px] text-ink-600 leading-[1.65]">
                                    <span className="text-anima-700 font-medium">
                                      Anima의 제안:{" "}
                                    </span>
                                    {ex.outputs
                                      .map((o) => `"${o}"`)
                                      .join(", ")}{" "}
                                    등
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Input → Output 요약 */}
                      <div className="rounded-[12px] border border-ink-200 overflow-hidden">
                        <div className="grid grid-cols-[1fr_1.6fr] bg-ink-100/60 text-[11px] font-semibold text-ink-600">
                          <div className="px-3 py-2 border-r border-ink-200">
                            {GUIDE_IO_HEADING.input}
                          </div>
                          <div className="px-3 py-2">
                            {GUIDE_IO_HEADING.output}
                          </div>
                        </div>
                        <ul className="divide-y divide-ink-200">
                          {GUIDE_IO_ROWS.map((row) => (
                            <li
                              key={row.input}
                              className="grid grid-cols-[1fr_1.6fr]"
                            >
                              <div className="px-3 py-2.5 border-r border-ink-200 text-[12px] text-ink-700 font-medium">
                                {row.input}
                              </div>
                              <div className="px-3 py-2.5 text-[12px] text-ink-600 leading-[1.6]">
                                {row.output}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>

            {/* 에디터의 한마디 */}
            <div className="mt-8 rounded-[12px] bg-ink-800 text-ink-100 px-5 py-5">
              <p className="text-eyebrow text-anima-300 mb-2">
                {GUIDE_OUTRO_LABEL}
              </p>
              <p className="text-[13px] leading-[1.8] text-ink-200">
                {GUIDE_OUTRO}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
