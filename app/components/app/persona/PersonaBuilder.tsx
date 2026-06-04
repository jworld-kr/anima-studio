"use client";

import { WorldBuilding } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Plus, Trash2 } from "lucide-react";
import { Input, Label, Textarea } from "../../ui/Input";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";

type SectionId =
  | "basic"
  | "personality"
  | "world"
  | "contentDirection"
  | "targetAudience"
  | "tone"
  | "examples"
  | "forbidden";

interface SectionDef {
  id: SectionId;
  label: string;
  hint: string;
}

const SECTIONS: SectionDef[] = [
  { id: "basic", label: "기본 정보", hint: "이름과 직업, 한 줄 소개" },
  { id: "personality", label: "성격과 말투", hint: "성격, 자주 쓰는 표현" },
  { id: "world", label: "세계관과 배경", hint: "환경, 관심사, 가치관" },
  { id: "contentDirection", label: "콘텐츠 방향", hint: "다룰 주제와 메시지" },
  { id: "targetAudience", label: "타겟 독자", hint: "글이 닿을 사람" },
  { id: "tone", label: "톤 설정", hint: "네 가지 기준의 균형" },
  { id: "examples", label: "예시 게시물", hint: "참고할 샘플 글" },
  { id: "forbidden", label: "금지 사항", hint: "절대 하지 말아야 할 것" },
];

interface PersonaBuilderProps {
  worldBuilding: WorldBuilding;
  onChange: (updated: WorldBuilding) => void;
}

/**
 * Helpers — return a partial setter for each section. Keeps the
 * branch logic out of the JSX.
 */
function makeSectionUpdater<K extends keyof WorldBuilding>(
  worldBuilding: WorldBuilding,
  onChange: (updated: WorldBuilding) => void,
  section: K
) {
  return (field: keyof WorldBuilding[K], value: unknown) => {
    onChange({
      ...worldBuilding,
      [section]: {
        ...(worldBuilding[section] as object),
        [field]: value,
      },
    });
  };
}

export function PersonaBuilder({
  worldBuilding,
  onChange,
}: PersonaBuilderProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("basic");

  return (
    <>
      {/* Desktop: side nav + form */}
      <div className="hidden lg:grid grid-cols-[220px_1fr] gap-10">
        <nav className="sticky top-2 self-start">
          <p className="text-eyebrow text-ink-400 mb-3 px-1">8 sections</p>
          <ol className="space-y-0.5">
            {SECTIONS.map((s, i) => {
              const isActive = activeSection === s.id;
              const filled = isSectionFilled(s.id, worldBuilding);
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-[8px] transition-colors flex items-center gap-3 ${
                      isActive
                        ? "bg-ink-100 text-ink-800"
                        : "text-ink-500 hover:text-ink-800 hover:bg-ink-50"
                    }`}
                  >
                    <span className="font-mono text-[10.5px] tabular-nums text-ink-400 mt-0.5 shrink-0">
                      0{i + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium tracking-[-0.005em] truncate">
                          {s.label}
                        </span>
                        {filled && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-anima-400 shrink-0"
                            aria-label="작성됨"
                          />
                        )}
                      </span>
                      <span className="block text-[11px] text-ink-400 mt-0.5 truncate">
                        {s.hint}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0">
          <SectionBody
            activeSection={activeSection}
            worldBuilding={worldBuilding}
            onChange={onChange}
          />
        </div>
      </div>

      {/* Mobile: accordion */}
      <div className="lg:hidden">
        <MobileAccordion
          worldBuilding={worldBuilding}
          onChange={onChange}
        />
      </div>
    </>
  );
}

/* ============================================================
   Mobile accordion
   ============================================================ */

function MobileAccordion({
  worldBuilding,
  onChange,
}: PersonaBuilderProps) {
  const [openId, setOpenId] = useState<SectionId>("basic");
  const refs = useRef<Record<string, HTMLLIElement | null>>({});

  const goToNext = (currentId: SectionId) => {
    const idx = SECTIONS.findIndex((s) => s.id === currentId);
    if (idx === -1 || idx === SECTIONS.length - 1) return;
    const nextId = SECTIONS[idx + 1].id;
    setOpenId(nextId);
  };

  // After open changes, scroll the newly opened item into view
  useEffect(() => {
    const el = refs.current[openId];
    if (!el) return;
    // Defer to next frame so layout settles before scrolling
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [openId]);

  return (
    <ol className="space-y-2">
      {SECTIONS.map((s, i) => {
        const isOpen = openId === s.id;
        const filled = isSectionFilled(s.id, worldBuilding);
        const isLast = i === SECTIONS.length - 1;
        return (
          <li
            key={s.id}
            ref={(el) => {
              refs.current[s.id] = el;
            }}
          >
            <Card
              className={`overflow-hidden transition-colors ${
                isOpen ? "border-ink-300" : ""
              }`}
            >
              <button
                onClick={() => setOpenId(isOpen ? ("" as SectionId) : s.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-mono text-[10.5px] tabular-nums text-ink-400 shrink-0">
                  0{i + 1}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[13.5px] font-medium text-ink-800 tracking-[-0.005em] truncate">
                      {s.label}
                    </span>
                    {filled && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-anima-400 shrink-0"
                        aria-label="작성됨"
                      />
                    )}
                  </span>
                  <span className="block text-[11.5px] text-ink-400 mt-0.5 truncate">
                    {s.hint}
                  </span>
                </span>
                <ChevronDown
                  size={14}
                  strokeWidth={1.75}
                  className={`text-ink-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-ink-200 px-4 py-5 bg-ink-50/30">
                  <SectionBody
                    activeSection={s.id}
                    worldBuilding={worldBuilding}
                    onChange={onChange}
                    compact
                  />
                  {!isLast && (
                    <div className="mt-6 pt-5 border-t border-ink-200/60">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => goToNext(s.id)}
                        trailingIcon={
                          <ArrowRight size={13} strokeWidth={1.75} />
                        }
                        className="w-full"
                      >
                        다음 — {SECTIONS[i + 1].label}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================================================
   Section "filled" detection
   ============================================================ */

function nonEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return true;
  if (Array.isArray(v)) return v.length > 0;
  return false;
}

function isSectionFilled(id: SectionId, wb: WorldBuilding): boolean {
  switch (id) {
    case "basic": {
      const b = wb.basic;
      return (
        nonEmpty(b.age) ||
        nonEmpty(b.job) ||
        nonEmpty(b.appearance) ||
        nonEmpty(b.oneline)
      );
    }
    case "personality": {
      const p = wb.personality;
      return (
        nonEmpty(p.traits) ||
        nonEmpty(p.expressions) ||
        nonEmpty(p.speechPattern) ||
        nonEmpty(p.forbiddenWords)
      );
    }
    case "world": {
      const w = wb.world;
      return (
        nonEmpty(w.background) ||
        nonEmpty(w.interests) ||
        nonEmpty(w.values) ||
        nonEmpty(w.dailyRoutine)
      );
    }
    case "contentDirection": {
      const c = wb.contentDirection;
      return (
        nonEmpty(c.mainTopics) ||
        nonEmpty(c.sellWhat) ||
        nonEmpty(c.message) ||
        nonEmpty(c.forbiddenTopics)
      );
    }
    case "targetAudience": {
      const t = wb.targetAudience;
      return (
        nonEmpty(t.description) ||
        nonEmpty(t.ageGroup) ||
        nonEmpty(t.interests) ||
        nonEmpty(t.toneTip)
      );
    }
    case "tone":
      // Tone defaults to all 5s; consider filled if any value differs from 5.
      return Object.values(wb.tone).some((v) => v !== 5);
    case "examples":
      return wb.examples.length > 0;
    case "forbidden":
      return nonEmpty(wb.forbiddenThings);
  }
}

/* ============================================================
   Section bodies
   ============================================================ */

function SectionBody({
  activeSection,
  worldBuilding,
  onChange,
  compact = false,
}: {
  activeSection: SectionId;
  worldBuilding: WorldBuilding;
  onChange: (u: WorldBuilding) => void;
  compact?: boolean;
}) {
  const updateBasic = makeSectionUpdater(worldBuilding, onChange, "basic");
  const updatePersonality = makeSectionUpdater(
    worldBuilding,
    onChange,
    "personality"
  );
  const updateWorld = makeSectionUpdater(worldBuilding, onChange, "world");
  const updateContentDirection = makeSectionUpdater(
    worldBuilding,
    onChange,
    "contentDirection"
  );
  const updateTargetAudience = makeSectionUpdater(
    worldBuilding,
    onChange,
    "targetAudience"
  );
  const updateTone = makeSectionUpdater(worldBuilding, onChange, "tone");

  if (activeSection === "basic") {
    return (
      <SectionWrap
        index="01"
        title="기본 정보"
        description="페르소나의 기본 신원. 이름·나이·직업·외형 정도면 첫 인상이 잡힙니다."
        compact={compact}
      >
        <Field label="이름" required>
          <Input
            value={worldBuilding.basic.name}
            onChange={(e) => updateBasic("name", e.target.value)}
            placeholder="예. 도원"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="나이" hint="숫자만 입력 (선택)">
            <Input
              type="number"
              value={worldBuilding.basic.age ?? ""}
              onChange={(e) =>
                updateBasic(
                  "age",
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              placeholder="예. 42"
            />
          </Field>
          <Field label="직업·역할" hint="짧은 직함이면 충분 (선택)">
            <Input
              value={worldBuilding.basic.job}
              onChange={(e) => updateBasic("job", e.target.value)}
              placeholder="예. 한식당 운영자"
            />
          </Field>
        </div>
        <Field label="외형" hint="필수는 아니지만, 디테일이 페르소나를 입체적으로 만듭니다.">
          <Textarea
            value={worldBuilding.basic.appearance ?? ""}
            onChange={(e) => updateBasic("appearance", e.target.value)}
            rows={3}
            placeholder="예. 작은 안경, 단정한 셔츠, 늘 손에 걸치고 다니는 천 행주."
          />
        </Field>
        <Field label="한 줄 소개" hint="이 페르소나를 한 문장으로 요약하면?">
          <Input
            value={worldBuilding.basic.oneline ?? ""}
            onChange={(e) => updateBasic("oneline", e.target.value)}
            placeholder="예. 대접의 무게를 아는 사람."
          />
        </Field>
      </SectionWrap>
    );
  }

  if (activeSection === "personality") {
    return (
      <SectionWrap
        index="02"
        title="성격과 말투"
        description="자주 쓰는 표현·말버릇·금지어까지. 페르소나의 말투가 여기서 정해집니다."
        compact={compact}
      >
        <Field label="주요 성격" hint="3~5개의 형용사로도 좋습니다.">
          <Textarea
            value={worldBuilding.personality.traits ?? ""}
            onChange={(e) => updatePersonality("traits", e.target.value)}
            rows={3}
            placeholder="예. 담담함, 차분함, 유행에 동요하지 않음"
          />
        </Field>
        <Field
          label="자주 쓰는 표현"
          hint="줄바꿈으로 구분하세요. 페르소나의 말버릇이 됩니다."
        >
          <Textarea
            value={(worldBuilding.personality.expressions ?? []).join("\n")}
            onChange={(e) =>
              updatePersonality(
                "expressions",
                splitLines(e.target.value)
              )
            }
            rows={4}
            placeholder={"예.\n그래도 여전히\n결국 사람의 일이지\n돌아보면…"}
          />
        </Field>
        <Field label="말투 특징">
          <Textarea
            value={worldBuilding.personality.speechPattern ?? ""}
            onChange={(e) => updatePersonality("speechPattern", e.target.value)}
            rows={2}
            placeholder="예. 짧고 단단한 문장. 끝을 흐리지 않음."
          />
        </Field>
        <Field
          label="금지어·표현"
          hint="이 페르소나가 절대 쓰지 않는 표현. 줄바꿈으로 구분."
        >
          <Textarea
            value={(worldBuilding.personality.forbiddenWords ?? []).join("\n")}
            onChange={(e) =>
              updatePersonality(
                "forbiddenWords",
                splitLines(e.target.value)
              )
            }
            rows={3}
            placeholder={"예.\n레전드\n핵\n갓생"}
          />
        </Field>
      </SectionWrap>
    );
  }

  if (activeSection === "world") {
    return (
      <SectionWrap
        index="03"
        title="세계관과 배경"
        description="페르소나가 살고 있는 환경, 일상, 지키는 가치."
        compact={compact}
      >
        <Field label="배경 설정" hint="어디서, 어떻게, 무엇을 하며 살고 있는지.">
          <Textarea
            value={worldBuilding.world.background ?? ""}
            onChange={(e) => updateWorld("background", e.target.value)}
            rows={3}
            placeholder="예. 서울 외곽의 작은 한식당을 12년째 혼자 운영 중."
          />
        </Field>
        <Field label="관심사" hint="줄바꿈으로 구분.">
          <Textarea
            value={(worldBuilding.world.interests ?? []).join("\n")}
            onChange={(e) =>
              updateWorld("interests", splitLines(e.target.value))
            }
            rows={3}
            placeholder={"예.\n식재료의 계절성\n동네의 변화\n옛 책방"}
          />
        </Field>
        <Field label="가치관">
          <Textarea
            value={worldBuilding.world.values ?? ""}
            onChange={(e) => updateWorld("values", e.target.value)}
            rows={2}
            placeholder="예. 유행을 좇지 않는다. 단단한 것을 만든다."
          />
        </Field>
        <Field label="일상 루틴">
          <Textarea
            value={worldBuilding.world.dailyRoutine ?? ""}
            onChange={(e) => updateWorld("dailyRoutine", e.target.value)}
            rows={2}
            placeholder="예. 새벽 5시에 시장, 9시에 가게, 11시에 점심 손님."
          />
        </Field>
      </SectionWrap>
    );
  }

  if (activeSection === "contentDirection") {
    return (
      <SectionWrap
        index="04"
        title="콘텐츠 방향"
        description="이 페르소나로 무엇을 이야기할지, 무엇은 이야기하지 않을지."
        compact={compact}
      >
        <Field label="주요 주제" hint="줄바꿈으로 구분.">
          <Textarea
            value={(worldBuilding.contentDirection.mainTopics ?? []).join(
              "\n"
            )}
            onChange={(e) =>
              updateContentDirection(
                "mainTopics",
                splitLines(e.target.value)
              )
            }
            rows={3}
            placeholder={"예.\n작은 가게의 운영\n식재료 이야기\n손님과의 거리감"}
          />
        </Field>
        <Field
          label="홍보·판매 대상"
          hint="이 페르소나가 알리거나 팔고 싶은 것이 있다면."
        >
          <Input
            value={worldBuilding.contentDirection.sellWhat ?? ""}
            onChange={(e) =>
              updateContentDirection("sellWhat", e.target.value)
            }
            placeholder="예. 도원 한식당 / 정기 도시락 구독"
          />
        </Field>
        <Field label="핵심 메시지" hint="이 페르소나가 전하고 싶은 한 줄.">
          <Textarea
            value={worldBuilding.contentDirection.message ?? ""}
            onChange={(e) =>
              updateContentDirection("message", e.target.value)
            }
            rows={2}
            placeholder="예. 작고 단단한 가게의 단단한 일상."
          />
        </Field>
        <Field
          label="금기 주제"
          hint="이 페르소나로는 절대 다루지 않을 주제. 줄바꿈으로 구분."
        >
          <Textarea
            value={(
              worldBuilding.contentDirection.forbiddenTopics ?? []
            ).join("\n")}
            onChange={(e) =>
              updateContentDirection(
                "forbiddenTopics",
                splitLines(e.target.value)
              )
            }
            rows={2}
            placeholder={"예.\n정치\n자극적인 가십"}
          />
        </Field>
      </SectionWrap>
    );
  }

  if (activeSection === "targetAudience") {
    return (
      <SectionWrap
        index="05"
        title="타겟 독자"
        description="이 페르소나의 글이 가장 깊게 닿을 사람을 구체화하세요."
        compact={compact}
      >
        <Field label="독자 정의">
          <Input
            value={worldBuilding.targetAudience.description ?? ""}
            onChange={(e) =>
              updateTargetAudience("description", e.target.value)
            }
            placeholder="예. 작은 가게를 혼자 꾸리는 30·40대"
          />
        </Field>
        <Field label="나이대">
          <select
            value={worldBuilding.targetAudience.ageGroup ?? ""}
            onChange={(e) =>
              updateTargetAudience("ageGroup", e.target.value)
            }
            className="w-full h-10 px-3 bg-paper border border-ink-200 rounded-[6px] text-[14px] text-ink-700 hover:border-ink-300 focus:outline-none focus:border-ink-700 transition-colors"
          >
            <option value="">선택</option>
            <option value="10s">10대</option>
            <option value="20s">20대</option>
            <option value="30s">30대</option>
            <option value="40s">40대</option>
            <option value="50s+">50대 이상</option>
            <option value="all">무관</option>
          </select>
        </Field>
        <Field label="관심사">
          <Textarea
            value={worldBuilding.targetAudience.interests ?? ""}
            onChange={(e) =>
              updateTargetAudience("interests", e.target.value)
            }
            rows={2}
            placeholder="예. 자영업 운영, 메뉴 기획, 동네 단골"
          />
        </Field>
        <Field
          label="톤 팁"
          hint="이 독자에게 글이 닿으려면 어떤 톤이어야 할지."
        >
          <Textarea
            value={worldBuilding.targetAudience.toneTip ?? ""}
            onChange={(e) =>
              updateTargetAudience("toneTip", e.target.value)
            }
            rows={2}
            placeholder="예. 가르치려 들지 말 것. 같은 처지에서 말할 것."
          />
        </Field>
      </SectionWrap>
    );
  }

  if (activeSection === "tone") {
    const sliders: Array<{
      key: keyof WorldBuilding["tone"];
      label: string;
      leftLabel: string;
      rightLabel: string;
    }> = [
      {
        key: "seriousness",
        label: "진지함",
        leftLabel: "유머",
        rightLabel: "진지함",
      },
      {
        key: "professionalism",
        label: "전문성",
        leftLabel: "친근함",
        rightLabel: "전문적",
      },
      {
        key: "formality",
        label: "격식",
        leftLabel: "캐주얼",
        rightLabel: "격식",
      },
      {
        key: "depth",
        label: "깊이",
        leftLabel: "가벼움",
        rightLabel: "깊이",
      },
    ];

    return (
      <SectionWrap
        index="06"
        title="톤 설정"
        description="네 가지 기준으로 페르소나의 말투를 미세 조정합니다."
        compact={compact}
      >
        <div className="space-y-7">
          {sliders.map((s) => {
            const value = worldBuilding.tone[s.key];
            return (
              <div key={s.key as string}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-medium text-ink-700">
                    {s.label}
                  </span>
                  <span className="font-mono text-[12px] text-ink-500 tabular-nums">
                    {value} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={value}
                  onChange={(e) =>
                    updateTone(s.key, parseInt(e.target.value, 10))
                  }
                  className="anima-range w-full"
                  aria-label={s.label}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[11px] text-ink-400">
                    {s.leftLabel}
                  </span>
                  <span className="text-[11px] text-ink-400">
                    {s.rightLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrap>
    );
  }

  if (activeSection === "examples") {
    return (
      <ExamplesSection
        worldBuilding={worldBuilding}
        onChange={onChange}
        compact={compact}
      />
    );
  }

  if (activeSection === "forbidden") {
    return (
      <SectionWrap
        index="08"
        title="금지 사항"
        description="페르소나가 절대 하지 말아야 할 것. 강하게, 단호하게."
        compact={compact}
      >
        <Field label="금지 사항">
          <Textarea
            value={worldBuilding.forbiddenThings ?? ""}
            onChange={(e) =>
              onChange({ ...worldBuilding, forbiddenThings: e.target.value })
            }
            rows={6}
            placeholder={
              "예.\n과장된 광고 카피.\n경쟁 가게에 대한 언급.\n‘갓생’ 같은 유행어."
            }
          />
        </Field>
      </SectionWrap>
    );
  }

  return null;
}

/* ============================================================
   Examples (separate because of internal state)
   ============================================================ */

function ExamplesSection({
  worldBuilding,
  onChange,
  compact = false,
}: {
  worldBuilding: WorldBuilding;
  onChange: (u: WorldBuilding) => void;
  compact?: boolean;
}) {
  const [tempTitle, setTempTitle] = useState("");
  const [tempContent, setTempContent] = useState("");

  const addExample = () => {
    if (!tempContent.trim()) return;
    onChange({
      ...worldBuilding,
      examples: [
        ...worldBuilding.examples,
        { title: tempTitle.trim() || undefined, content: tempContent.trim() },
      ],
    });
    setTempTitle("");
    setTempContent("");
  };

  const removeExample = (idx: number) => {
    onChange({
      ...worldBuilding,
      examples: worldBuilding.examples.filter((_, i) => i !== idx),
    });
  };

  return (
    <SectionWrap
      index="07"
      title="예시 게시물"
      description="페르소나가 실제로 썼을 법한 글 한두 개. 톤이 가장 잘 잡히는 자료입니다."
      compact={compact}
    >
      <div className="mb-3 rounded-[10px] border border-anima-200 bg-anima-50 px-4 py-3 flex items-start gap-2.5">
        <span className="text-anima-600 text-[12px] mt-[1px] leading-none">✦</span>
        <p className="text-[12.5px] text-anima-700 leading-[1.6]">
          예시 게시물은 말투와 호흡을 잡기 위한 참고입니다. 실제 콘텐츠는 발행할
          때마다 새로 만들어집니다.
        </p>
      </div>

      <Card className="p-4 space-y-3">
        <Field label="제목" hint="선택">
          <Input
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            placeholder="예. 어제 단골이 두고 간 우산"
          />
        </Field>
        <Field label="본문" required>
          <Textarea
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            rows={5}
            placeholder="예시 본문…"
          />
        </Field>
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={addExample}
            leadingIcon={<Plus size={12} strokeWidth={1.75} />}
            disabled={!tempContent.trim()}
          >
            예시 추가
          </Button>
        </div>
      </Card>

      {worldBuilding.examples.length > 0 && (
        <div className="space-y-2">
          <p className="text-eyebrow text-ink-400">
            등록된 예시 · {worldBuilding.examples.length}
          </p>
          {worldBuilding.examples.map((ex, idx) => (
            <Card key={idx} variant="muted" className="p-4 group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {ex.title && (
                    <p className="text-[13px] font-medium text-ink-800 mb-1.5">
                      {ex.title}
                    </p>
                  )}
                  <p className="text-[13px] text-ink-700 leading-[1.65] whitespace-pre-wrap">
                    {ex.content}
                  </p>
                </div>
                <button
                  onClick={() => removeExample(idx)}
                  className="p-1 rounded text-ink-400 hover:text-[#7c3a31] hover:bg-[rgba(181,86,74,0.10)] transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="삭제"
                >
                  <Trash2 size={13} strokeWidth={1.75} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </SectionWrap>
  );
}

/* ============================================================
   Building blocks
   ============================================================ */

function SectionWrap({
  index,
  title,
  description,
  children,
  compact = false,
}: {
  index: string;
  title: string;
  description: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <section className="animate-fade-in">
        <p className="text-[12.5px] text-ink-500 leading-[1.6] mb-5">
          {description}
        </p>
        <div className="space-y-4">{children}</div>
      </section>
    );
  }
  return (
    <section className="animate-fade-in">
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[11px] tabular-nums text-ink-400 tracking-[0.06em]">
            {index}
          </span>
          <span className="h-px w-8 bg-ink-200" />
          <Badge variant="muted">section</Badge>
        </div>
        <h2 className="font-display text-[28px] text-ink-800 tracking-[-0.025em] leading-tight mb-2">
          {title}
        </h2>
        <p className="text-[14px] text-ink-500 leading-[1.65] max-w-[560px]">
          {description}
        </p>
      </div>
      <div className="space-y-5 max-w-[640px]">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label hint={hint} required={required}>
        {label}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
