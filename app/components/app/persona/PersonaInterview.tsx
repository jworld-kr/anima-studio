"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Check, User2, Building2 } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { Button } from "@/app/components/ui/Button";
import { Input, Textarea } from "@/app/components/ui/Input";
import { Skeleton } from "@/app/components/ui/Skeleton";
import {
  SURVEY_STEPS,
  SURVEY_QUESTIONS,
  SurveyAnswers,
  SurveyAnswer,
  SurveyMode,
  SurveyQuestion,
  MultiChoiceQuestion,
  TextQuestion,
  isAnswered,
} from "@/app/lib/persona-interview";
import type { WorldBuilding } from "@/app/types";

/** assistNote의 **굵게** 구간을 <strong>으로, 나머지는 그대로 렌더 (줄바꿈은 whitespace-pre-line이 처리). */
function renderAssistNote(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-anima-700">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

interface Props {
  onComplete: (result: {
    worldBuilding: WorldBuilding;
    filledKeys: string[];
  }) => void;
  onBack: () => void;
}

function emptyAnswer(q: SurveyQuestion): SurveyAnswer {
  if (q.kind === "mode") return { id: q.id, kind: "mode", value: "person" };
  if (q.kind === "text") return { id: q.id, kind: "text", value: "" };
  return { id: q.id, kind: q.kind, selected: [], custom: "" };
}

export function PersonaInterview({ onComplete, onBack }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>(() => {
    const init: SurveyAnswers = {};
    for (const [id, q] of Object.entries(SURVEY_QUESTIONS)) {
      init[id] = emptyAnswer(q);
    }
    return init;
  });
  const [synthesizing, setSynthesizing] = useState(false);
  const [error, setError] = useState("");

  const step = SURVEY_STEPS[stepIdx];
  const isLastStep = stepIdx === SURVEY_STEPS.length - 1;

  const stepQuestions = step.questionIds
    .map((id) => SURVEY_QUESTIONS[id])
    .filter(Boolean);

  // Validation for this step — all non-optional questions must be answered.
  const stepValid = useMemo(() => {
    return stepQuestions.every((q) => {
      if ((q as any).optional) return true;
      const a = answers[q.id];
      return isAnswered(q, a);
    });
  }, [answers, stepQuestions]);

  const updateAnswer = (id: string, next: SurveyAnswer) => {
    setAnswers((prev) => ({ ...prev, [id]: next }));
    setError("");
  };

  const handleNext = async () => {
    if (!stepValid) {
      setError("아직 답변하지 않은 항목이 있어요.");
      return;
    }
    if (!isLastStep) {
      setStepIdx(stepIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Synthesize
    setSynthesizing(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const nameAns = answers["name"];
      const fallbackName =
        nameAns?.kind === "text" && nameAns.value.trim()
          ? nameAns.value.trim()
          : "새 페르소나";

      const res = await fetch("/api/persona/interview/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ answers, fallbackName }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "SYNTHESIZE_FAILED");
      }
      onComplete({
        worldBuilding: data.worldBuilding,
        filledKeys: data.filledKeys ?? [],
      });
    } catch (e) {
      console.error(e);
      setError(
        "페르소나 생성에 실패했어요. 잠시 후 다시 시도하거나 직접 채우기로 넘어가주세요."
      );
      setSynthesizing(false);
    }
  };

  const handleBack = () => {
    if (stepIdx === 0) {
      onBack();
      return;
    }
    setStepIdx(stepIdx - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (synthesizing) {
    return <SynthesizingScreen />;
  }

  const progress = ((stepIdx + 1) / SURVEY_STEPS.length) * 100;

  return (
    <div className="max-w-[680px] mx-auto py-8 sm:py-12">
      {/* Step header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 text-[11px] text-ink-400 tabular-nums tracking-[0.04em]">
          <span>
            Step {stepIdx + 1} / {SURVEY_STEPS.length}
          </span>
          <span className="text-ink-500">{step.section}</span>
        </div>
        <div className="h-[2px] bg-ink-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-anima-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content — keyed so each step animates in like a new turn */}
      <div key={stepIdx} className="animate-page-turn">
        {/* Anima narration — a speech bubble at section transitions */}
        {step.description && (
          <div className="flex gap-3 mb-9">
            <span
              className="w-8 h-8 rounded-full bg-ink-800 text-anima-200 flex items-center justify-center shrink-0"
              aria-hidden
            >
              <Sparkles size={14} strokeWidth={1.75} />
            </span>
            <div className="flex-1 min-w-0 rounded-[16px] rounded-tl-[5px] bg-anima-50 border border-anima-200 px-4 py-3.5">
              <p className="text-[10px] tracking-[0.1em] uppercase text-anima-600 font-medium mb-1">
                Anima
              </p>
              <p className="text-[14.5px] text-ink-700 leading-[1.7] break-keep">
                {step.description}
              </p>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-12">
          {stepQuestions.map((q) => (
            <QuestionBlock
              key={q.id}
              q={q}
              answer={answers[q.id]}
              mode={
                answers.mode?.kind === "mode"
                  ? answers.mode.value
                  : "person"
              }
              onChange={(next) => updateAnswer(q.id, next)}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-[8px] bg-[rgba(181,86,74,0.08)] border border-[rgba(181,86,74,0.20)]">
          <p className="text-[12.5px] text-[#7c3a31] leading-[1.5]">
            {error}
          </p>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-500 hover:text-ink-800 transition-colors"
        >
          <ArrowLeft size={13} strokeWidth={1.75} />
          {stepIdx === 0 ? "다른 방식으로" : "이전 단계"}
        </button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          trailingIcon={
            isLastStep ? (
              <Sparkles size={14} strokeWidth={1.75} />
            ) : (
              <ArrowRight size={14} strokeWidth={1.75} />
            )
          }
        >
          {isLastStep ? "페르소나 만들기" : "다음 단계"}
        </Button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function QuestionBlock({
  q,
  answer,
  mode,
  onChange,
}: {
  q: SurveyQuestion;
  answer: SurveyAnswer | undefined;
  mode: SurveyMode;
  onChange: (a: SurveyAnswer) => void;
}) {
  return (
    <div>
      <h3
        className="font-display text-ink-800 mb-2 break-keep"
        style={{
          fontSize: 20,
          lineHeight: 1.4,
          letterSpacing: "-0.02em",
          fontWeight: 500,
        }}
      >
        {q.question}
        {(q as any).optional && (
          <span className="ml-2 text-[11px] text-ink-400 font-normal tracking-normal">
            선택
          </span>
        )}
      </h3>
      {("hint" in q && q.hint) && (
        <p className="text-[13px] text-ink-500 leading-[1.65] mb-3 break-keep whitespace-pre-line">
          {q.hint}
        </p>
      )}

      {"assistNote" in q && (q as MultiChoiceQuestion).assistNote && (
        <div className="mb-5 flex items-start gap-2.5 rounded-[10px] border border-anima-200 bg-anima-50/70 px-3.5 py-3">
          <Sparkles
            size={15}
            strokeWidth={1.75}
            className="text-anima-600 shrink-0 mt-0.5"
          />
          <p className="text-[12.5px] text-anima-700 leading-[1.7] break-keep whitespace-pre-line">
            {renderAssistNote((q as MultiChoiceQuestion).assistNote!)}
          </p>
        </div>
      )}

      {q.kind === "mode" && (
        <ModeBlock
          value={(answer?.kind === "mode" ? answer.value : "person") as SurveyMode}
          onChange={(v) =>
            onChange({ id: q.id, kind: "mode", value: v })
          }
        />
      )}
      {q.kind === "text" && (
        <TextBlock
          q={q as TextQuestion}
          mode={mode}
          value={answer?.kind === "text" ? answer.value : ""}
          onChange={(v) =>
            onChange({ id: q.id, kind: "text", value: v })
          }
        />
      )}
      {(q.kind === "single" || q.kind === "multi") && (
        <ChoiceBlock
          q={q as MultiChoiceQuestion}
          selected={
            answer?.kind === q.kind ? answer.selected : []
          }
          custom={
            answer?.kind === q.kind ? answer.custom ?? "" : ""
          }
          onChange={(selected, custom) =>
            onChange({
              id: q.id,
              kind: q.kind as "single" | "multi",
              selected,
              custom,
            })
          }
        />
      )}
    </div>
  );
}

/* ─────── Mode (person/brand) ─────── */
function ModeBlock({
  value,
  onChange,
}: {
  value: SurveyMode;
  onChange: (v: SurveyMode) => void;
}) {
  const opts: { id: SurveyMode; label: string; desc: string; icon: typeof User2 }[] =
    [
      {
        id: "person",
        label: "개인 / 퍼스널 브랜딩",
        desc: "인플루언서, 전문가, 크리에이터 등",
        icon: User2,
      },
      {
        id: "brand",
        label: "브랜드 / 비즈니스",
        desc: "F&B, 패션, 이커머스, 에이전시 등",
        icon: Building2,
      },
    ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {opts.map((o) => {
        const Icon = o.icon;
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`text-left rounded-[12px] border p-4 transition-colors ${
              active
                ? "border-ink-800 bg-ink-50"
                : "border-ink-200 bg-paper hover:border-ink-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon
                size={14}
                strokeWidth={1.75}
                className={active ? "text-ink-800" : "text-ink-400"}
              />
              <p
                className={`text-[14px] font-medium ${
                  active ? "text-ink-800" : "text-ink-700"
                }`}
              >
                {o.label}
              </p>
              {active && (
                <Check
                  size={13}
                  strokeWidth={2}
                  className="text-anima-600 ml-auto"
                />
              )}
            </div>
            <p className="text-[12px] text-ink-500 leading-[1.5]">{o.desc}</p>
          </button>
        );
      })}
    </div>
  );
}

/* ─────── Text input ─────── */
function TextBlock({
  q,
  mode,
  value,
  onChange,
}: {
  q: TextQuestion;
  mode: SurveyMode;
  value: string;
  onChange: (v: string) => void;
}) {
  const branchedGroups = q.examplesByMode?.[mode];

  return (
    <div>
      {q.multiline ? (
        <Textarea
          rows={3}
          value={value}
          placeholder={q.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          value={value}
          placeholder={q.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* Mode-branched grouped examples take precedence. */}
      {branchedGroups && branchedGroups.length > 0 ? (
        <div className="mt-4 rounded-[10px] border border-ink-200 bg-ink-50/50 p-4 space-y-3">
          <p
            className={
              q.exampleHeading
                ? "text-[12px] font-medium text-ink-600"
                : "text-[10px] tracking-[0.08em] uppercase text-ink-400 font-medium"
            }
          >
            {q.exampleHeading ?? `예시 — ${mode === "brand" ? "브랜드" : "1인 크리에이터"}`}
          </p>
          {branchedGroups.map((group, gi) => (
            <div key={`${gi}-${group.label}`}>
              {group.label && (
                <p className="text-[11.5px] text-ink-500 font-medium mb-1.5 flex items-center gap-1.5">
                  {group.emoji && <span>{group.emoji}</span>}
                  <span>{group.label}</span>
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((ex, i) => (
                  <li
                    key={i}
                    className="text-[12px] text-ink-600 leading-[1.55] flex gap-2"
                  >
                    <span className="text-ink-300 shrink-0">—</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : q.examples && q.examples.length > 0 ? (
        <div className="mt-3 rounded-[10px] border border-ink-200 bg-ink-50/50 p-3">
          <p className="text-[10px] tracking-[0.08em] uppercase text-ink-400 mb-1.5 font-medium">
            예시
          </p>
          <ul className="space-y-1">
            {q.examples.map((ex, i) => (
              <li
                key={i}
                className="text-[12px] text-ink-600 leading-[1.55] flex gap-2"
              >
                <span className="text-ink-300 shrink-0">—</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ─────── Choice (single or multi with groups, + custom) ─────── */
function ChoiceBlock({
  q,
  selected,
  custom,
  onChange,
}: {
  q: MultiChoiceQuestion;
  selected: string[];
  custom: string;
  onChange: (selected: string[], custom: string) => void;
}) {
  const toggle = (opt: string) => {
    if (q.kind === "single") {
      onChange([opt], custom);
      return;
    }
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt), custom);
    } else {
      if (q.maxSelected && selected.length >= q.maxSelected) return;
      onChange([...selected, opt], custom);
    }
  };

  // Long-form single-select (e.g. role archetypes with descriptions) reads
  // better as stacked rows than wrapped pills.
  const isLongFormSingle =
    q.kind === "single" &&
    q.groups.some((g) => g.options.some((o) => o.length > 24));

  if (isLongFormSingle) {
    return (
      <div className="space-y-2.5">
        {q.groups.flatMap((group) =>
          group.options.map((opt) => {
            const active = selected.includes(opt);
            // Split "🎨 큐레이터 (취향·철학형) — 설명" into title / description.
            const [titlePart, ...descParts] = opt.split(" — ");
            const desc = descParts.join(" — ");
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`w-full text-left px-4 py-3.5 rounded-[12px] border transition-colors break-keep flex items-start gap-3 ${
                  active
                    ? "border-ink-800 bg-ink-50 shadow-[0_1px_2px_rgba(11,10,7,0.05)]"
                    : "border-ink-200 bg-paper hover:border-ink-300"
                }`}
              >
                <span
                  className={`mt-0.5 w-4 h-4 rounded-full border-[1.5px] shrink-0 flex items-center justify-center transition-colors ${
                    active ? "border-ink-800" : "border-ink-300"
                  }`}
                  aria-hidden
                >
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-ink-800" />
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-[14px] font-semibold leading-[1.4] mb-0.5 ${
                      active ? "text-ink-900" : "text-ink-800"
                    }`}
                  >
                    {titlePart}
                  </span>
                  {desc && (
                    <span className="block text-[12.5px] text-ink-500 leading-[1.6]">
                      {desc}
                    </span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {q.groups.map((group) => (
        <div key={group.label}>
          {q.groups.length > 1 && (
            <p className="text-[12px] tracking-[0.04em] text-ink-600 font-medium mb-3 flex items-center gap-1.5">
              {group.emoji && <span>{group.emoji}</span>}
              <span>{group.label}</span>
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => {
              const active = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`px-3.5 py-2 rounded-full border text-[13px] leading-[1.3] transition-colors ${
                    active
                      ? "border-ink-800 bg-ink-800 text-ink-50"
                      : "border-ink-200 bg-paper text-ink-600 hover:border-ink-300 hover:text-ink-800"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {q.allowCustom && (
        <div className="pt-2">
          <label className="block text-[11.5px] tracking-[0.04em] text-ink-500 font-medium mb-2">
            + 직접 추가
          </label>
          {q.customHint && (
            <p className="text-[12px] text-ink-500 leading-[1.6] mb-2">
              {q.customHint}
            </p>
          )}
          <Textarea
            rows={3}
            value={custom}
            placeholder="줄바꿈이나 쉼표로 구분해서 적어주세요."
            onChange={(e) => onChange(selected, e.target.value)}
          />
          {q.customExamples && q.customExamples.length > 0 && (
            <div className="mt-2.5 rounded-[10px] border border-ink-200 bg-ink-50/50 p-3">
              <p className="text-[10px] tracking-[0.08em] uppercase text-ink-400 mb-1.5 font-medium">
                이런 식으로 적으시면 좋아요
              </p>
              <ul className="space-y-1">
                {q.customExamples.map((ex, i) => (
                  <li
                    key={i}
                    className="text-[12px] text-ink-600 leading-[1.55] flex gap-2"
                  >
                    <span className="text-ink-300 shrink-0">—</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {q.kind === "multi" && (q.maxSelected || q.minSelected) && (
        <p className="text-[11px] text-ink-400 mt-2 tabular-nums">
          {selected.length}개 선택됨
          {q.minSelected ? ` · 최소 ${q.minSelected}개` : ""}
          {q.maxSelected ? ` · 최대 ${q.maxSelected}개` : ""}
        </p>
      )}
    </div>
  );
}

/* ─────── Synthesizing screen ─────── */
const SYNTH_ROLLING = [
  "⚙️ 선택하신 성격 조각과 단어 파편을 입체적으로 조합하는 중…",
  "🗣️ 스레드(Threads)에 가장 자연스럽게 녹아들 구어체 말투를 매핑하는 중…",
  "🛡️ 피하고 싶은 모습을 분석해 브랜드 고유의 신념과 철학을 도출하는 중…",
  "✍️ 오직 당신만을 위한 8개 레이어의 전담 에디터를 생성하는 중…",
];

function SynthesizingScreen() {
  const [rollIdx, setRollIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setRollIdx((i) => (i + 1) % SYNTH_ROLLING.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-[560px] mx-auto py-16 sm:py-24 text-center">
      <div className="inline-flex items-center gap-2 text-anima-700 mb-5">
        <Sparkles size={14} strokeWidth={1.75} className="animate-pulse" />
        <p className="text-eyebrow text-anima-700">Synthesizing</p>
      </div>
      <h2
        className="font-display text-ink-800 mb-4 break-keep"
        style={{
          fontSize: "clamp(24px, 3vw, 32px)",
          lineHeight: 1.25,
          letterSpacing: "-0.02em",
          fontWeight: 400,
        }}
      >
        Anima가 브랜드 정밀 진단 결과를
        <br />
        분석하고 있습니다.
      </h2>
      <p className="text-[13.5px] text-ink-400 leading-[1.7] mb-10">
        약 30초 정도 걸려요. 잠시만 기다려주세요.
      </p>

      {/* Rolling status */}
      <div className="max-w-[460px] mx-auto rounded-[12px] border border-ink-200 bg-ink-50/50 px-5 py-4 min-h-[56px] flex items-center justify-center">
        <p
          key={rollIdx}
          className="text-[13.5px] text-ink-600 leading-[1.6] animate-fade-in break-keep"
        >
          {SYNTH_ROLLING[rollIdx]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="max-w-[460px] mx-auto mt-4 h-[3px] bg-ink-100 rounded-full overflow-hidden">
        <div className="h-full bg-anima-400 animate-[synthbar_30s_linear_forwards]" />
      </div>
    </div>
  );
}
