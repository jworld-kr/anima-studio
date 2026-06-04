"use client";

import Link from "next/link";
import { useEffect, useState, Fragment, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Feather,
  Sparkles,
  Layers,
  ChevronDown,
  PenLine,
  Shuffle,
  Bot,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Logo } from "../brand/Logo";
import { InkBottle } from "../brand/InkIcon";
import { INK_PACKAGES } from "@/app/lib/ink";

/* ============================================================
   Pain — "이런 거 불편하지 않으셨어요?"
   ============================================================ */

const PAINS = [
  {
    n: "01",
    title: "소재 고갈",
    headline: "오늘 스레드에 대체 뭐 올리지?",
    body: "매일 밤 빈 화면에 커서만 깜빡거리며 시간만 버리고 있다면. 결국 짜내고 짜내다 '오늘도 화이팅!' 같은 영혼 없는 글만 올리고 있다면.",
    icon: PenLine,
  },
  {
    n: "02",
    title: "흔들리는 톤앤매너",
    headline: "누가 쓰느냐에 따라 브랜드 말투가 달라지네...",
    body: "내가 쓸 때, 직원이 쓸 때, 외주를 맡길 때마다 브랜드 색깔이 널을 뛰고 있다면. 우리 브랜드만의 고유한 '말맛'과 정체성이 희미해지고 있다면.",
    icon: Shuffle,
  },
  {
    n: "03",
    title: "뻔한 AI 양산형 글",
    headline: "AI가 쓴 티가 너무 나서 결국 다 지웠어요.",
    body: "챗GPT를 써봤지만 '현대 사회에서~', '~해보세요!' 같은 오글거리는 번역체와 알맹이 없는 뻔한 글만 뱉어내서 결국 처음부터 다시 쓰느라 지쳤다면.",
    icon: Bot,
  },
];

export function Pain() {
  return (
    <section id="pain" className="py-28 lg:py-36 border-t border-ink-200/60">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="Problem"
          align="left"
          title={
            <>
              작은 브랜드의 콘텐츠는
              <br />
              왜 늘 같은 자리에서 막힐까요?
            </>
          }
          description="이 중 하나라도 익숙하다면, Anima가 필요한 시점입니다."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAINS.map((p) => (
            <article
              key={p.n}
              className="group relative rounded-[18px] border border-ink-200 bg-paper p-7 lg:p-8 overflow-hidden hover:border-ink-300 hover:shadow-[0_16px_48px_rgba(11,10,7,0.07)] transition-all duration-300"
            >
              {/* 아이콘 */}
              <span className="relative w-12 h-12 rounded-[14px] bg-gradient-to-br from-[rgba(95,110,80,0.16)] to-[rgba(95,110,80,0.03)] border border-[rgba(95,110,80,0.22)] flex items-center justify-center text-anima-600 mb-6 shadow-[0_4px_12px_rgba(95,110,80,0.10)]">
                <p.icon size={20} strokeWidth={1.6} />
              </span>

              {/* 카테고리 */}
              <p className="relative text-[11px] tracking-[0.14em] uppercase text-anima-600/85 font-semibold mb-3">
                {p.title}
              </p>

              {/* 인용 헤드라인 */}
              <p
                className="relative font-display text-ink-800 mb-3.5 break-keep"
                style={{
                  fontSize: "clamp(18px, 1.5vw, 21px)",
                  lineHeight: 1.42,
                  letterSpacing: "-0.02em",
                  fontWeight: 400,
                }}
              >
                <span className="text-anima-500/45 mr-0.5">“</span>
                {p.headline}
                <span className="text-anima-500/45">”</span>
              </p>

              {/* 본문 */}
              <p className="relative text-[13.5px] text-ink-500 leading-[1.8] break-keep">
                {p.body}
              </p>

              {/* 하단 강조선 (hover) */}
              <span
                aria-hidden
                className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-anima-500/60 to-anima-500/10 group-hover:w-full transition-all duration-500"
              />
            </article>
          ))}
        </div>

        <div className="mt-16 max-w-[680px] mx-auto text-center">
          <p className="text-[16px] lg:text-[17px] text-ink-700 leading-[1.75] break-keep">
            문제는 글재주가 아닙니다.
            <br />
            <span className="text-ink-900 font-medium">
              우리 브랜드만의 '페르소나'가 정의되지 않았기 때문입니다.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Persona Importance — 페르소나 자체의 가치 + 8섹션 빌더 시연
   ============================================================ */

interface PersonaSectionDef {
  n: string;
  label: string;
  description: string;
  fields: { label: string; value: string; multiline?: boolean; danger?: boolean }[];
}

const PERSONA_SECTIONS: PersonaSectionDef[] = [
  {
    n: "01",
    label: "기본 정보",
    description:
      "브랜드의 이름과 정체성. 페르소나의 첫 인상이 잡히는 자리입니다.",
    fields: [
      { label: "브랜드 이름", value: "누크 커피 (Nook Coffee)" },
      { label: "카테고리", value: "성수동 골목길의 작은 필터커피 전문점" },
      {
        label: "한 줄 소개",
        value:
          "에스프레소 머신 없이, 손님의 속도에 맞춰 천천히 내리는 필터커피 바.",
      },
    ],
  },
  {
    n: "02",
    label: "성격과 말투",
    description:
      "자주 쓰는 표현, 말버릇, 절대 쓰지 않을 단어까지. 페르소나의 말투가 정해집니다.",
    fields: [
      {
        label: "주요 성격",
        value: "덤덤한, 뚝심 있는, 친근한",
      },
      {
        label: "자주 쓰는 표현",
        value: "너만의 속도가 있어?\n~하잖아\n진짜 처참했지\n오래 가야 돼",
        multiline: true,
      },
      {
        label: "말투 특징",
        value:
          "아는 척하며 가르치려 들지 않고, 동네 아지트에서 단골에게 편하게 털어놓는 듯한 반말 구어체.",
      },
      {
        label: "금지어·표현",
        value: "현대 사회에서\n~해보세요!\n혁신적인\n최상의 서비스\n안녕하십니까",
        multiline: true,
        danger: true,
      },
    ],
  },
  {
    n: "03",
    label: "세계관과 배경",
    description:
      "브랜드가 어떤 환경에서 어떤 리듬으로 살아가는지를 정의합니다.",
    fields: [
      {
        label: "배경",
        value:
          "성수동 번화가에서 비껴간 조용한 골목길, 테이블 3개와 바 테이블이 전부인 공간을 5년째 지키고 있음.",
      },
      {
        label: "관심사",
        value:
          "싱글 오리진 원두\n턴테이블 엘피\n동네 단골들의 안부\n오래된 가구 레이아웃",
        multiline: true,
      },
      {
        label: "가치관",
        value:
          "빠른 세상에서 일부러 속도를 늦출 때 비로소 보이는 진짜 가치들을 믿어.",
      },
      {
        label: "일상 루틴",
        value:
          "매일 아침 8시, 머신 대신 드립 포트에 물을 끓이며 하루를 시작해.",
      },
    ],
  },
  {
    n: "04",
    label: "콘텐츠 방향",
    description: "어떤 이야기를 다룰지, 어떤 이야기는 절대 다루지 않을지.",
    fields: [
      {
        label: "주요 주제",
        value:
          "카페 운영 중 겪은 찌질한 시행착오\n필터커피를 고집하는 이유\n공간을 채우는 음악과 가구 이야기\n골목길에서 마주친 단골들과의 일상",
        multiline: true,
      },
      {
        label: "핵심 메시지",
        value: "효율과 속도에 쫓기지 말고, 가끔은 우리만의 속도로 걸어가자.",
      },
      {
        label: "금기 주제",
        value:
          "매출 인증 및 돈 많이 버는 법\n타 브랜드나 프랜차이즈 비방\n정치·종교 및 갈등 유발 키워드",
        multiline: true,
        danger: true,
      },
    ],
  },
  {
    n: "05",
    label: "타겟 독자",
    description: "이 브랜드의 글이 가장 깊게 닿을 사람을 구체화합니다.",
    fields: [
      {
        label: "독자 정의",
        value:
          "치열한 일상과 효율주의에 지쳐 자기만의 아지트와 위로가 필요한 2030 직장인 및 크리에이터.",
      },
      {
        label: "관심사",
        value: "독립 브랜드, 로컬 카페, 사이드 프로젝트, 미니멀리즘",
      },
      {
        label: "톤 팁",
        value:
          "비즈니스적인 조언이나 정답을 제시하려 하지 말고, 나도 너와 똑같이 고민하고 흔들리는 사람이라는 걸 보여줘야 해.",
      },
    ],
  },
  {
    n: "06",
    label: "톤 설정",
    description: "네 가지 기준으로 페르소나의 말투를 미세 조정합니다.",
    fields: [
      { label: "진지함", value: "5 / 10" },
      { label: "전문성", value: "7 / 10" },
      { label: "격식", value: "1 / 10" },
      { label: "깊이", value: "8 / 10" },
    ],
  },
  {
    n: "07",
    label: "예시 게시물",
    description:
      "브랜드가 실제로 썼을 법한 글. 톤을 가장 정확히 학습시키는 자료입니다.",
    fields: [
      {
        label: "샘플 1",
        value:
          "가끔 손님들이 왜 에스프레소 머신 안 들여놓냐고 물어보더라고. 당연히 기계 쓰면 1분에 몇 잔씩 뽑아내고 돈도 더 벌겠지. 근데 난 포트에 물 붓는 동안 손님이랑 '오늘 날씨 좋네요' 하고 시선 맞추는 그 몇 분이 도저히 포기가 안 돼. 돈보다 그 밀도가 더 좋아서 그래.",
        multiline: true,
      },
      {
        label: "샘플 2",
        value:
          "오늘 오픈하자마자 한 단골손님이 와서 메뉴판도 안 보고 늘 마시던 걸로 달라고 하더라. 내 공간이 누군가에게 고민 없이 찾아올 수 있는 '당연한 곳'이 되었다는 게 참 뭉클했어. 거창한 브랜딩이 별건가, 이런 당연함을 쌓아가는 게 진짜지.",
        multiline: true,
      },
    ],
  },
  {
    n: "08",
    label: "금지 사항",
    description: "이 페르소나로 절대 하지 말아야 할 것들.",
    fields: [
      {
        label: "금지 사항",
        value:
          "전문 마케터처럼 정돈된 광고성 카피나 상투적인 멘트 쓰지 않기\n'-다.'로 끝나는 딱딱한 문어체나 줄표(—) 사용하지 않기\n게시물 끝에 구걸하는 듯한 '팔로우·좋아요' 유도 문구 넣지 않기",
        multiline: true,
        danger: true,
      },
    ],
  },
];

// Cycle only through high-impact sections: 02, 04, 08 (zero-indexed: 1, 3, 7)
const FEATURED_SECTION_INDICES = [1, 3, 7];

export function PersonaImportance() {
  const [featuredPos, setFeaturedPos] = useState(0);
  const activeIdx = FEATURED_SECTION_INDICES[featuredPos];

  useEffect(() => {
    const id = window.setInterval(() => {
      setFeaturedPos((p) => (p + 1) % FEATURED_SECTION_INDICES.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const active = PERSONA_SECTIONS[activeIdx];

  return (
    <section
      id="persona"
      className="py-28 lg:py-36 border-t border-ink-200/60 relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 0%, rgba(196, 211, 184, 0.18) 0%, rgba(251, 250, 247, 0) 70%)",
        }}
      />
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="Persona"
          title={
            <>
              수백만 원짜리 브랜딩 컨설팅,
              <br />
              이제 Anima 스튜디오 안에서 완성됩니다.
            </>
          }
          description={
            <>
              <span className="block">
                내 브랜드의 색깔을 어떻게 정의해야 할지{" "}
                <br className="sm:hidden" />
                <span className="text-ink-700 font-medium">
                  더 이상 헤매지 마세요.
                </span>
              </span>
              <span className="block mt-2.5">
                Anima의 정밀 진단 시스템이{" "}
                <br className="sm:hidden" />
                <span className="text-ink-700 font-medium">
                  몇 가지 직관적인 질문
                </span>
                을 통해 당신의 비즈니스를 분석합니다.
              </span>
              <span className="block mt-2.5">
                잠재 고객의 반응을 이끌어낼 최적의 타깃,
                <br className="sm:hidden" />
                독보적인 브랜드 성격, 가장 자연스러운 말투까지{" "}
                <br className="sm:hidden" />
                <span className="text-ink-700 font-medium">
                  하나의 완벽한 페르소나
                </span>
                로 도출해 드립니다.
              </span>
            </>
          }
        />

        {/* Builder preview — desktop (full app mock) */}
        <div className="hidden lg:block mt-16 lg:mt-20 max-w-[1080px] mx-auto">
          <div
            className="rounded-[20px] border border-ink-200 bg-paper overflow-hidden"
            style={{
              boxShadow:
                "0 30px 80px rgba(11, 10, 7, 0.08), 0 12px 24px rgba(11, 10, 7, 0.05)",
            }}
          >
            {/* Window chrome */}
            <div className="h-9 border-b border-ink-200/60 bg-ink-50 flex items-center px-4 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
              <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
              <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
              <span className="ml-4 text-[11px] text-ink-400 tracking-[0.02em] tabular-nums">
                anima.studio / persona / 도원
              </span>
            </div>

            <div className="grid grid-cols-[240px_1fr]">
              {/* Section nav */}
              <aside className="border-r border-ink-200/60 bg-canvas/40 p-6">
                <p className="text-[10px] text-ink-400 tracking-[0.12em] uppercase font-medium mb-3">
                  8 sections
                </p>
                <ol className="space-y-0.5">
                  {PERSONA_SECTIONS.map((s, i) => {
                    const isActive = i === activeIdx;
                    const isFeatured = FEATURED_SECTION_INDICES.includes(i);
                    const featuredPosOfThis =
                      FEATURED_SECTION_INDICES.indexOf(i);
                    const isPastOrCurrent =
                      isFeatured && featuredPosOfThis <= featuredPos;
                    return (
                      <li key={s.n}>
                        <div
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-[6px] transition-colors duration-500 ${
                            isActive
                              ? "bg-ink-100 text-ink-800"
                              : "text-ink-500"
                          }`}
                        >
                          <span className="font-mono text-[10px] tabular-nums text-ink-400 shrink-0">
                            {s.n}
                          </span>
                          <span className="flex-1 min-w-0 text-[12.5px] font-medium tracking-[-0.005em] truncate">
                            {s.label}
                          </span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500 ${
                              isPastOrCurrent ? "bg-anima-400" : "bg-ink-200"
                            }`}
                            aria-hidden
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </aside>

              {/* Section body — keyed so it animates on switch */}
              <div className="p-9 h-[520px] overflow-hidden">
                <div key={active.n} className="animate-page-turn">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-[10.5px] text-ink-400 tabular-nums tracking-[0.08em]">
                      {active.n}
                    </span>
                    <span className="h-px w-6 bg-ink-200" />
                    <span className="text-[10.5px] text-ink-400 tracking-[0.12em] uppercase font-medium">
                      section
                    </span>
                  </div>
                  <h3 className="font-display text-[28px] text-ink-800 tracking-[-0.025em] mb-2">
                    {active.label}
                  </h3>
                  <p className="text-[13.5px] text-ink-500 leading-[1.65] mb-7">
                    {active.description}
                  </p>

                  <div className="space-y-5">
                    {active.fields.map((f) => (
                      <PreviewField
                        key={f.label}
                        label={f.label}
                        value={f.value}
                        multiline={f.multiline}
                        danger={f.danger}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Builder preview — mobile (compact card) */}
        <div className="lg:hidden mt-12 max-w-[480px] mx-auto">
          <div
            className="rounded-[16px] border border-ink-200 bg-paper overflow-hidden"
            style={{
              boxShadow:
                "0 16px 40px rgba(11, 10, 7, 0.08), 0 6px 12px rgba(11, 10, 7, 0.04)",
            }}
          >
            {/* Pagination dots */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 bg-canvas/40">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink-400 tabular-nums tracking-[0.08em]">
                  {active.n}
                </span>
                <span className="text-[11px] text-ink-400 tracking-[0.06em] uppercase font-medium">
                  / 08 section
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {FEATURED_SECTION_INDICES.map((idx, i) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                      i === featuredPos ? "bg-anima-400" : "bg-ink-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-6 h-[500px] overflow-hidden">
              <div key={active.n} className="animate-page-turn">
                <h3 className="font-display text-[22px] text-ink-800 tracking-[-0.025em] mb-2">
                  {active.label}
                </h3>
                <p className="text-[13px] text-ink-500 leading-[1.65] mb-6">
                  {active.description}
                </p>
                <div className="space-y-4">
                  {active.fields.map((f) => (
                    <PreviewField
                      key={f.label}
                      label={f.label}
                      value={f.value}
                      multiline={f.multiline}
                      danger={f.danger}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function PreviewField({
  label,
  value,
  multiline = false,
  danger = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  danger?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-ink-700 tracking-[-0.005em] mb-1.5">
        {label}
      </p>
      <div
        className={`px-3.5 py-2.5 rounded-[6px] border bg-paper ${
          danger ? "border-[rgba(181,86,74,0.20)]" : "border-ink-200"
        }`}
      >
        <p
          className={`text-[13px] leading-[1.6] ${
            danger ? "text-[#7c3a31]" : "text-ink-700"
          } ${multiline ? "whitespace-pre-wrap" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Why Thread — "왜 지금 Thread인가"
   ============================================================ */

const THREAD_STATS = [
  {
    value: "320M+",
    label: "글로벌 사용자",
    detail: "Threads는 출시 후 빠르게 전 세계 3억 2천만 명 규모의 사용자를 모았습니다.",
  },
  {
    value: "+2.4×",
    label: "국내 성장률 1위",
    detail: "한국은 Threads가 가장 빠르게 성장하고 있는 국가 중 하나로, 작년 대비 사용량이 2.4배 늘었습니다.",
  },
  {
    value: "0 → 1만",
    label: "팔로워 0명에서 도달 최단 기록",
    detail: "팔로워가 거의 없는 계정이라도 글 한 편으로 1만 명 이상에게 노출되는 사례가 흔하게 나옵니다.",
  },
];

const THREAD_REASONS = [
  {
    n: "01",
    title: "카메라가 필요 없습니다.",
    body: "화려한 사진이나 영상 편집 기술 없이, 오직 '글의 힘'만으로 찐팬을 만듭니다.",
  },
  {
    n: "02",
    title: "팔로워 0명이어도 괜찮습니다.",
    body: "스레드만의 독특한 알고리즘이 내 글을 좋아할 만한 잠재 고객에게 알아서 배달해 줍니다.",
  },
  {
    n: "03",
    title: "가장 빠르게 성장합니다.",
    body: "지금 가장 폭발적으로 성장 중인 텍스트 플랫폼에서 초기 선점 효과를 누리세요.",
  },
];

export function WhyThread() {
  return (
    <section
      id="why-thread"
      className="py-28 lg:py-36 relative overflow-hidden bg-ink-900 text-ink-50"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 10%, rgba(166, 181, 150, 0.10) 0%, rgba(11, 10, 7, 0) 70%)",
        }}
      />
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="Why Thread"
          theme="dark"
          title={
            <>
              작은 브랜드일수록,
              <br />
              지금 스레드(Threads)로 시작해야 합니다.
            </>
          }
          description={
            <>
              글 한 편이면 충분합니다.
              <br />
              알고리즘이 팔로워가 아니라 글 자체를 평가하기 때문입니다.
            </>
          }
        />

        {/* Stats */}
        <div className="mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-3 gap-3">
          {THREAD_STATS.map((s) => (
            <article
              key={s.label}
              className="relative rounded-[16px] border border-ink-700 bg-ink-800/60 backdrop-blur-sm p-7 lg:p-8 overflow-hidden"
            >
              <span
                aria-hidden
                className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-anima-300/50 to-transparent"
              />
              <p
                className="font-mono text-ink-50 mb-3 tabular-nums"
                style={{
                  fontSize: "clamp(34px, 4.4vw, 52px)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.04em",
                  fontWeight: 500,
                }}
              >
                {s.value}
              </p>
              <p className="text-eyebrow text-anima-300 mb-3">{s.label}</p>
              <p className="text-[12.5px] text-ink-300 leading-[1.65]">
                {s.detail}
              </p>
            </article>
          ))}
        </div>

        {/* Reasons */}
        <div className="mt-12 lg:mt-16 max-w-[820px] mx-auto">
          {THREAD_REASONS.map((r, i) => (
            <div
              key={r.n}
              className={`grid grid-cols-[56px_1fr] gap-5 py-6 ${
                i !== THREAD_REASONS.length - 1
                  ? "border-b border-ink-700/70"
                  : ""
              }`}
            >
              <span className="font-mono text-[11px] text-ink-400 tabular-nums tracking-[0.1em] pt-1.5">
                {r.n}
              </span>
              <div>
                <h3
                  className="font-display text-ink-50 mb-1.5"
                  style={{
                    fontSize: "clamp(18px, 1.8vw, 22px)",
                    lineHeight: 1.3,
                    letterSpacing: "-0.025em",
                    fontWeight: 400,
                  }}
                >
                  {r.title}
                </h3>
                <p className="text-[14px] text-ink-300 leading-[1.75]">
                  {r.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ROI — 광고대행사 vs Anima 비용 비교
   ============================================================ */

const ROI_STATS = [
  {
    value: "₩1,500,000",
    label: "광고대행사 월 평균",
    detail: "월 20개 콘텐츠 운영 기준 (소형 대행사).",
  },
  {
    value: "₩19,900",
    label: "Anima Pro 월 비용",
    detail: "페르소나 3개 + 월 55개 콘텐츠 (얼리 액세스 보너스 포함).",
  },
  {
    value: "75배",
    label: "경제적인 선택",
    detail: "대행사 한 달 비용이면 Anima Pro를 6년 이상 운영합니다.",
    highlight: true,
  },
];

const ROI_COMPARISON: {
  label: string;
  agency: string;
  anima: string;
}[] = [
  { label: "월 콘텐츠 발행", agency: "20개", anima: "55개" },
  { label: "콘텐츠 단가", agency: "75,000원", anima: "362원" },
  { label: "수정·재작성", agency: "3~7일", anima: "즉시 재생성" },
  { label: "톤 운영 방식", agency: "프로젝트별 합의", anima: "페르소나 고정" },
  { label: "발행 결정권", agency: "대행사 일정", anima: "직접 결정" },
  {
    label: "연간 비용",
    agency: "₩18,000,000",
    anima: "₩238,800",
  },
];

export function ROI() {
  return (
    <section id="roi" className="py-28 lg:py-36 border-t border-ink-200/60">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="ROI"
          align="left"
          title={
            <>
              대행사 한 달 비용으로,
              <br />
              Anima는 1년을 쓰고도 남습니다.
            </>
          }
          description="광고대행사를 통해 콘텐츠를 운영하던 비용의 일부로, 같은 일을 직접 할 수 있습니다."
        />

        {/* Big stat cards */}
        <div className="mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-3 gap-3">
          {ROI_STATS.map((s) => (
            <article
              key={s.label}
              className={`relative rounded-[16px] border p-7 lg:p-8 overflow-hidden ${
                s.highlight
                  ? "border-ink-800 bg-ink-800 text-ink-50"
                  : "border-ink-200 bg-paper"
              }`}
            >
              {s.highlight && (
                <span
                  aria-hidden
                  className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-anima-300/60 to-transparent"
                />
              )}
              <p
                className={`font-mono mb-3 tabular-nums ${
                  s.highlight ? "text-ink-50" : "text-ink-800"
                }`}
                style={{
                  fontSize: "clamp(34px, 4.4vw, 52px)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.04em",
                  fontWeight: 500,
                }}
              >
                {s.value}
              </p>
              <p
                className={`text-eyebrow mb-3 ${
                  s.highlight ? "text-anima-300" : "text-anima-600"
                }`}
              >
                {s.label}
              </p>
              <p
                className={`text-[12.5px] leading-[1.65] ${
                  s.highlight ? "text-ink-300" : "text-ink-500"
                }`}
              >
                {s.detail}
              </p>
            </article>
          ))}
        </div>

        {/* Comparison table */}
        <div
          className="mt-12 lg:mt-16 rounded-[16px] border border-ink-200 bg-paper overflow-hidden"
          style={{
            boxShadow:
              "0 4px 16px rgba(11, 10, 7, 0.04), 0 1px 2px rgba(11, 10, 7, 0.04)",
          }}
        >
          {/* Table header */}
          <div className="grid grid-cols-[1.2fr_minmax(0,1fr)_minmax(0,1fr)] bg-ink-50/60 border-b border-ink-200">
            <div className="p-4 lg:p-5 text-[11px] text-ink-500 tracking-[0.08em] uppercase font-medium">
              항목
            </div>
            <div className="p-4 lg:p-5 text-[11px] text-ink-400 tracking-[0.08em] uppercase font-medium border-l border-ink-200">
              광고대행사
            </div>
            <div className="p-4 lg:p-5 text-[11px] text-anima-700 tracking-[0.08em] uppercase font-medium border-l border-ink-200 bg-anima-50/40">
              Anima Pro
            </div>
          </div>

          {ROI_COMPARISON.map((row, i) => {
            const isLast = i === ROI_COMPARISON.length - 1;
            return (
              <div
                key={row.label}
                className={`grid grid-cols-[1.2fr_minmax(0,1fr)_minmax(0,1fr)] ${
                  !isLast ? "border-b border-ink-200" : ""
                }`}
              >
                <div className="p-4 lg:p-5 text-[13px] lg:text-[14px] text-ink-700 font-medium">
                  {row.label}
                </div>
                <div className="p-4 lg:p-5 text-[12.5px] lg:text-[14px] text-ink-500 border-l border-ink-200 tabular-nums whitespace-nowrap">
                  {row.agency}
                </div>
                <div
                  className={`p-4 lg:p-5 text-[12.5px] lg:text-[14px] border-l border-ink-200 bg-anima-50/40 tabular-nums whitespace-nowrap ${
                    isLast
                      ? "text-ink-900 font-semibold"
                      : "text-ink-800 font-medium"
                  }`}
                >
                  {row.anima}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing line */}
        <div className="mt-12 lg:mt-14 text-center max-w-[680px] mx-auto break-keep">
          <p className="text-[15px] lg:text-[16px] text-ink-500 leading-[1.8]">
            소통 안 되는 광고 대행사, 매번 바뀌는 프리랜서 에디터 때문에
            스트레스받지 마세요.
          </p>
          <p className="mt-2.5 text-[15px] lg:text-[16px] text-ink-700 leading-[1.8]">
            우리 브랜드의 아이덴티티와 스토리를 모두 기억하는{" "}
            <span className="text-ink-900 font-medium">든든한 전담 에디터</span>를
            곁에 두는 가장 현명한 방법입니다.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   How it works
   ============================================================ */

const STEPS = [
  {
    n: "01",
    title: "페르소나 설계",
    desc: "간단한 질문에 답하며 내 브랜드 고유의 말투와 타깃을 설정합니다.",
    icon: Feather,
  },
  {
    n: "02",
    title: "키워드로 주제 생성",
    desc: "오늘 있었던 사소한 일이나 단어를 툭 던지면, Anima가 10개의 매력적인 주제를 제안합니다.",
    icon: Sparkles,
  },
  {
    n: "03",
    title: "가벼운 슥- 확인 후 발행",
    desc: "Anima가 차려놓은 초안을 가볍게 눈으로 확인하고 원클릭 발행하세요. 한두 줄 살짝 수정하는 것도 자유롭습니다.",
    icon: Layers,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-28 lg:py-36 border-t border-ink-200/60">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="How it works"
          align="left"
          title={
            <>
              마케팅에 쓰는 시간이
              <br />
              10분의 1로 줄어듭니다.
            </>
          }
          description="1인 크리에이터부터 모든 분야의 브랜드까지, 한 번 정의된 페르소나가 매일의 콘텐츠를 만듭니다."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink-200/60 mt-16 rounded-[14px] overflow-hidden border border-ink-200">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-paper p-8 lg:p-10">
              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-[11px] text-ink-400 tabular-nums tracking-[0.08em]">
                  {s.n}
                </span>
                <s.icon
                  size={20}
                  strokeWidth={1.5}
                  className="text-anima-500"
                />
              </div>
              <h3 className="font-display text-[24px] text-ink-800 tracking-[-0.02em] mb-3">
                {s.title}
              </h3>
              <p className="text-[14px] text-ink-500 leading-[1.65]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Pricing
   ============================================================ */

interface PlanFeature {
  text: string;
  bonus?: string;
  soon?: boolean;
}

interface Plan {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  highlight: boolean;
  earlyAccess?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "₩0",
    cadence: "",
    description: "신용카드 없이 바로 시작. 페르소나 빌더 전 기능 사용 가능.",
    features: [
      { text: "페르소나 1개" },
      { text: "매월 700 잉크 · 콘텐츠 약 5편" },
      { text: "발행 히스토리 30일 보관" },
    ],
    cta: "무료로 시작",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₩19,900",
    cadence: "/ 월",
    description: "1인 사업자와 작은 브랜드를 위한 표준 플랜.",
    features: [
      { text: "페르소나 3개" },
      { text: "매월 3,500 잉크 · 콘텐츠 약 30편", bonus: "+500" },
      { text: "발행 히스토리 무제한 보관" },
      { text: "잉크 충전 할인" },
    ],
    cta: "Pro 시작하기",
    highlight: true,
    earlyAccess: true,
  },
  {
    name: "Studio",
    price: "₩49,000",
    cadence: "/ 월",
    description: "여러 브랜드를 운영하는 에이전시와 멀티브랜드 팀.",
    features: [
      { text: "페르소나 10개" },
      { text: "매월 10,000 잉크 · 콘텐츠 약 88편", bonus: "+1,500" },
      { text: "발행 히스토리 무제한 보관" },
      { text: "잉크 충전 할인" },
      { text: "팀 멤버 초대", soon: true },
    ],
    cta: "Studio 시작하기",
    highlight: false,
    earlyAccess: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-28 lg:py-36 border-t border-ink-200/60">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="Pricing"
          title={
            <>
              브랜드의 크기에 맞춰,
              <br />
              필요한 만큼만 합리적으로.
            </>
          }
          description="신용카드 없이 무료로 시작하고, 필요할 때 업그레이드하세요."
        />

        {/* Early access banner */}
        <div className="mt-10 mb-3 flex justify-center">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 px-4 py-2.5 sm:py-1.5 rounded-[14px] sm:rounded-full bg-anima-50 border border-anima-200 text-anima-700 text-center break-keep">
            <span className="font-medium text-[12px] whitespace-nowrap">
              🔥 Early Access 한정 혜택
            </span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-anima-400/60" aria-hidden />
            <span className="text-[12px] text-anima-700/80">
              지금 가입하시면 할인된 금액으로 이용하실 수 있습니다.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={`relative rounded-[16px] p-7 lg:p-8 border transition-colors flex flex-col ${
                p.highlight
                  ? "border-ink-800 bg-ink-800 text-ink-50"
                  : "border-ink-200 bg-paper text-ink-700 hover:border-ink-300"
              }`}
              style={
                p.highlight
                  ? {
                      boxShadow:
                        "0 24px 60px rgba(11, 10, 7, 0.16), 0 8px 16px rgba(11, 10, 7, 0.06)",
                    }
                  : undefined
              }
            >
              {p.highlight && (
                <span
                  aria-hidden
                  className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-anima-300/70 to-transparent"
                />
              )}

              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`font-display text-[26px] tracking-[-0.02em] ${
                    p.highlight ? "text-ink-50" : "text-ink-800"
                  }`}
                >
                  {p.name}
                </h3>
                {p.highlight && (
                  <span className="text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full bg-anima-400/20 text-anima-200 border border-anima-400/30 font-medium">
                    추천
                  </span>
                )}
              </div>

              <p
                className={`text-[13px] leading-[1.6] mb-7 ${
                  p.highlight ? "text-ink-300" : "text-ink-500"
                }`}
              >
                {p.description}
              </p>

              <div className="flex items-baseline gap-1 mb-7">
                <span
                  className={`font-display tracking-[-0.03em] ${
                    p.highlight ? "text-ink-50" : "text-ink-800"
                  }`}
                  style={{ fontSize: "clamp(36px, 3.5vw, 44px)" }}
                >
                  {p.price}
                </span>
                <span
                  className={`text-[13px] ${
                    p.highlight ? "text-ink-300" : "text-ink-400"
                  }`}
                >
                  {p.cadence}
                </span>
              </div>

              <Link
                href={
                  p.name === "Free"
                    ? "/login"
                    : // TODO: 자동결제(빌링) 계약 활성화 후 `/checkout/${p.name.toLowerCase()}` 로 되돌릴 것
                      `/test-checkout/${p.name.toLowerCase()}`
                }
                className="block mb-7"
              >
                <Button
                  variant={p.highlight ? "anima" : "secondary"}
                  size="md"
                  className="w-full"
                  trailingIcon={<ArrowRight size={14} strokeWidth={1.75} />}
                >
                  {p.cta}
                </Button>
              </Link>

              <ul className="space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li
                    key={f.text}
                    className={`flex items-start gap-2 text-[13.5px] ${
                      f.soon
                        ? p.highlight
                          ? "text-ink-400"
                          : "text-ink-400"
                        : p.highlight
                        ? "text-ink-200"
                        : "text-ink-600"
                    }`}
                  >
                    <Check
                      size={14}
                      strokeWidth={1.75}
                      className={`mt-0.5 shrink-0 ${
                        f.soon
                          ? "text-ink-300"
                          : p.highlight
                          ? "text-anima-300"
                          : "text-anima-500"
                      }`}
                    />
                    <span className="flex-1">
                      {f.text}
                      {f.soon && (
                        <span
                          className={`ml-1.5 inline-flex items-center px-1.5 py-px rounded-[4px] text-[10px] font-medium tracking-tight ${
                            p.highlight
                              ? "bg-ink-700 text-ink-300 border border-ink-600"
                              : "bg-ink-100 text-ink-500 border border-ink-200"
                          }`}
                        >
                          곧 제공
                        </span>
                      )}
                      {f.bonus && (
                        <span
                          className={`ml-1.5 inline-flex items-center px-1.5 py-px rounded-[4px] text-[10.5px] font-mono font-semibold tabular-nums tracking-tight ${
                            p.highlight
                              ? "bg-anima-300/20 text-anima-200 border border-anima-300/30"
                              : "bg-anima-50 text-anima-700 border border-anima-200"
                          }`}
                          title="얼리 액세스 보너스 — 구독 유지 동안 매월 적립"
                        >
                          {f.bonus}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
                {p.earlyAccess && (
                  <li
                    className={`flex items-start gap-2 text-[12px] pt-2.5 mt-2 border-t ${
                      p.highlight
                        ? "border-ink-700 text-anima-200"
                        : "border-ink-200 text-anima-700"
                    }`}
                  >
                    <span
                      className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                        p.highlight ? "bg-anima-300" : "bg-anima-400"
                      }`}
                    />
                    <span className="leading-[1.55]">
                      얼리 액세스 보너스 매월 적립
                    </span>
                  </li>
                )}
              </ul>
            </article>
          ))}
        </div>

        {/* Ink top-up packages preview */}
        <div className="mt-20 lg:mt-24">
          <div className="text-center mb-10">
            <p className="text-eyebrow text-anima-600 mb-3">Top-up</p>
            <h3
              className="font-display text-ink-800 mb-3"
              style={{
                fontSize: "clamp(24px, 3vw, 32px)",
                lineHeight: 1.25,
                letterSpacing: "-0.025em",
                fontWeight: 400,
              }}
            >
              잉크가 부족할 때, 한 병씩.
            </h3>
            <p className="text-[14px] text-ink-500 leading-[1.6] max-w-[460px] mx-auto">
              필요한 양만큼, 추가로 충전 후 사용할 수 있습니다.
            </p>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-3 gap-3 max-w-[820px] mx-auto">
            {INK_PACKAGES.map((p) => {
              const isMid = p.id === "ink_regular";
              return (
                <article
                  key={p.id}
                  className={`relative rounded-[14px] border p-6 transition-colors ${
                    isMid
                      ? "border-ink-800 bg-ink-800 text-ink-50"
                      : "border-ink-200 bg-paper hover:border-ink-300"
                  }`}
                >
                  {isMid && (
                    <span
                      aria-hidden
                      className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-anima-300/70 to-transparent"
                    />
                  )}
                  <div
                    className={`mb-4 h-[64px] flex items-end ${
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
                    className={`font-display text-[18px] tracking-[-0.015em] mb-1 ${
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
                      style={{ fontSize: 24, fontWeight: 500 }}
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
                    {p.bonusPercent > 0 && (
                      <span
                        className={`ml-1.5 text-[10.5px] font-medium ${
                          isMid ? "text-anima-200" : "text-anima-700"
                        }`}
                      >
                        +{p.bonusPercent}%
                      </span>
                    )}
                  </div>
                  <p
                    className={`font-display tracking-[-0.02em] pt-3 border-t border-current/10 ${
                      isMid ? "text-ink-50" : "text-ink-800"
                    }`}
                    style={{ fontSize: 18 }}
                  >
                    {p.priceLabel}
                  </p>
                </article>
              );
            })}
          </div>

          {/* Mobile horizontal scroll carousel */}
          <div className="md:hidden -mx-6">
            <div
              className="flex gap-3 overflow-x-auto px-6 snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollPaddingLeft: 24 }}
            >
              {INK_PACKAGES.map((p) => {
                const isMid = p.id === "ink_regular";
                return (
                  <article
                    key={p.id}
                    className={`snap-start shrink-0 w-[78%] max-w-[280px] relative rounded-[14px] border p-5 transition-colors ${
                      isMid
                        ? "border-ink-800 bg-ink-800 text-ink-50"
                        : "border-ink-200 bg-paper"
                    }`}
                  >
                    {isMid && (
                      <span
                        aria-hidden
                        className="absolute -top-px left-5 right-5 h-px bg-gradient-to-r from-transparent via-anima-300/70 to-transparent"
                      />
                    )}
                    <div
                      className={`mb-3 h-[60px] flex items-end ${
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
                      {p.bonusPercent > 0 && (
                        <span
                          className={`ml-1 text-[10.5px] font-medium ${
                            isMid ? "text-anima-200" : "text-anima-700"
                          }`}
                        >
                          +{p.bonusPercent}%
                        </span>
                      )}
                    </div>
                    <p
                      className={`pt-3 border-t border-current/10 font-display tracking-[-0.02em] ${
                        isMid ? "text-ink-50" : "text-ink-800"
                      }`}
                      style={{ fontSize: 17 }}
                    >
                      {p.priceLabel}
                    </p>
                  </article>
                );
              })}
              {/* Trailing spacer so the last card snaps comfortably */}
              <span aria-hidden className="shrink-0 w-1" />
            </div>
          </div>

          <p className="mt-6 text-center text-[12px] text-ink-400 leading-[1.6]">
            잉크 차감 기준 · 주제 생성 30 · 콘텐츠 생성 100 · 재생성 50 ·
            발행 무료
          </p>
        </div>

        {/* Footnote */}
        <p className="mt-12 text-center text-[12px] text-ink-400 leading-[1.6]">
          모든 결제는 토스페이먼츠로 안전하게 처리됩니다. 1개월 단위 결제로
          자동 청구되지 않습니다.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */

interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  label: string;
  items: FaqItem[];
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    label: "🌊 Anima에 대하여",
    items: [
      {
        q: "다른 AI 글쓰기 툴이랑 뭐가 다른가요?",
        a: `기존 AI 툴들은 "친근하게 써줘", "전문적으로 써줘"처럼 대충 분위기만 바꾸는 데 그쳐요. 반면 Anima는 이름, 직업, 가치관, 심지어 일상 루틴까지 아예 **'인간의 정체성'을 통째로 설계**해 두고 글을 쓰기 시작합니다. 챗GPT 특유의 오글거리는 번역체나 알맹이 없는 뻔한 소리가 아니라, **진짜 내 친구가 쓴 것 같은 뾰족한 글**이 나오는 이유가 바로 여기에 있습니다.`,
      },
      {
        q: "요즘 자동으로 글 올려주는 AI 프로그램도 많던데, 뭐가 다른가요?",
        a: `Anima는 '질보다 양'으로 피드를 어지럽히는 **자동 양산형 매크로 프로그램이 절대 아닙니다.** 영혼 없이 긁어온 글로 피드를 도배하는 건 오히려 브랜드 이미지를 갉아먹는 독이 되니까요. Anima의 목표는 단순히 글을 찍어내는 게 아니라, **우리 브랜드만의 독창적인 철학과 스토리**를 가장 밀도 높게 녹여내는 것입니다. 사장님은 그저 클릭 몇 번으로 **탑티어 에디터가 밤새 고심해 쓴 것 같은 고품질 브랜딩 콘텐츠**를 손에 쥐게 됩니다.`,
      },
      {
        q: "광고 대행사를 쓰거나 에디터를 고용하는 것과 비교하면 어떤가요?",
        a: `한 달에 수백만 원씩 드는 광고 대행사를 쓰거나 전문 카피라이터를 고용하면 참 좋겠지만, 작은 브랜드에겐 현실적으로 너무 큰 비용이죠. 게다가 대행사가 우리 브랜드의 깊은 속사정이나 철학까지 완벽히 이해하고 글을 쓰기란 불가능에 가깝습니다. **Anima는 우리 가게의 가치관, 사장님의 일상 루틴, 절대 양보할 수 없는 신념까지 완벽히 학습한 '우리 브랜드 전담 수석 에디터'**를 월 몇 만 원으로 곁에 두는 효과를 줍니다. 대행사보다 우리 브랜드를 더 잘 이해하는 똑똑한 러닝메이트를 경험해 보세요.`,
      },
      {
        q: "페르소나는 무조건 '실제 사람'으로만 만들어야 하나요?",
        a: `아뇨, 전혀요! **가게나 브랜드 자체가 하나의 페르소나**가 될 수 있습니다. 사장님 본인의 목소리를 그대로 복제한 1인칭 개인 계정도 좋고, "우리 브랜드는 오늘~"로 시작하는 브랜드 공식 계정 형태도 얼마든지 가능합니다. 어떤 형태든 마치 한 사람이 로그인해서 쭉 써 내려간 듯한 **완벽한 일관성**을 지켜드려요.`,
      },
      {
        q: "스레드(Threads) 말고 다른 채널도 쓸 수 있나요?",
        a: `**지금은 스레드만 뾰족하게 정식 지원**하고 있어요. 인플루언서나 작은 브랜드가 복잡한 이미지 피드 없이, 오직 '말맛' 하나로 가장 빠르게 팬덤을 모을 수 있는 채널이 스레드이기 때문입니다. 하지만 걱정 마세요. 여기서 빌드업한 고유의 페르소나를 그대로 활용해서 **인스타 캡션, 블로그, 쇼츠 대본까지** 뽑아낼 수 있는 확장 기능을 곧 업데이트할 예정입니다.`,
      },
    ],
  },
  {
    label: "🛠️ 사용 방법",
    items: [
      {
        q: "페르소나는 한 번 만들면 끝인가요? 수정은 안 되나요?",
        a: `한 번 잘 세팅해 두면 그다음부터는 매일 아침 **'글감 주제'만 툭 던져주시면** 됩니다. 하지만 브랜드가 성장하고 방향이 바뀌면 페르소나도 당연히 같이 자라야겠죠? 8개 섹션 모두 언제든지 마음에 들게 수정할 수 있으며, **고치는 즉시 다음 글부터 바뀐 성격이 바로 반영**됩니다.`,
      },
      {
        q: "한 계정에서 여러 브랜드를 동시에 키울 수 있나요?",
        a: `네, 가능합니다! **Pro 플랜은 최대 3개, Studio 플랜은 10개**까지 독립된 페르소나를 운영할 수 있어요. 각 페르소나마다 콘텐츠 히스토리와 말투 설정이 완벽하게 분리되어 작동하기 때문에, 부계정을 여러 개 운영하셔도 **톤앤매너가 서로 섞일 걱정이 전혀 없습니다.**`,
      },
      {
        q: "스레드 앱에 자동으로 글이 올라가나요?",
        a: `생성된 콘텐츠에서 '발행' 버튼을 누르면 스레드 작성 창이 열리면서 **첫 줄(오프닝)이 자동으로 채워집니다.** 스레드 특성상 이어지는 댓글(타래)들은 화면에서 원클릭으로 클립보드에 복사해 갈 수 있도록 설계해 두었어요. **마지막 최종 업로드 버튼은 사장님이 직접** 누르기 때문에, 발행 직전에 한 번 더 검토할 수 있어 안전합니다.`,
      },
    ],
  },
  {
    label: "💳 요금과 결제",
    items: [
      {
        q: "결제는 어떤 방식으로 진행되나요?",
        a: `모든 결제는 **토스페이먼츠를 통해 안전하고 확실하게** 처리됩니다. 신용카드, 체크카드는 물론 간편결제(토스페이)까지 편하게 이용하실 수 있습니다. 참고로 **무료 플랜은 카드 등록 조차 필요 없으니** 부담 없이 먼저 써보세요!`,
      },
      {
        q: "이번 달 콘텐츠 생성 한도를 다 쓰면 어떻게 되나요?",
        a: `이번 달 한도가 똑 떨어지면 **다음 결제(갱신)일까지 새 글 생성 기능이 잠시 멈춥니다.** 다만 **이미 만들어둔 글을 고치거나 발행하는 건 언제든 가능**해요. 매달 한도가 조금 부족하다고 느껴지신다면 상위 플랜으로 언제든 업그레이드하실 수 있고, 반대로 다운그레이드도 자유롭습니다.`,
      },
      {
        q: "구독을 취소하면 제가 만든 페르소나랑 글들은 다 날아가나요?",
        a: `아뇨, 소중한 자산인데 **절대 그냥 지우지 않습니다.** 구독을 해지하셔도 계정이 무료 플랜으로 자동 전환될 뿐, 기존에 만들어두신 **페르소나와 콘텐츠 기록은 안전하게 보관**됩니다. 다만 무료 플랜의 개수 한도를 넘어가는 페르소나는 잠시 '보관(비활성화)' 상태가 되며, 새 글 작성이 제한됩니다. **다시 구독하시면 언제든 그대로 이어서** 쓰실 수 있어요.`,
      },
    ],
  },
];

/**
 * 답변 본문의 **굵게** 구간을 <strong>으로 렌더한다.
 * 화면에 마크업 기호(**)가 그대로 노출되지 않도록 처리.
 */
function renderAnswer(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink-800">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-28 lg:py-36 border-t border-ink-200/60">
      <div className="mx-auto max-w-[960px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="FAQ"
          title={
            <>
              자주 묻는
              <br />
              질문.
            </>
          }
          align="left"
          description="결정 전에 가장 자주 듣는 질문들을 정리했습니다. 여기서 답을 찾지 못하셨다면 언제든 문의해주세요."
        />

        <div className="mt-12 lg:mt-14 space-y-12">
          {FAQ_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-eyebrow text-ink-400 mb-4">{group.label}</p>
              <div className="border-t border-ink-200">
                {group.items.map((f, i) => (
                  <details
                    key={i}
                    className="group border-b border-ink-200"
                  >
                    <summary className="flex items-start justify-between gap-6 py-5 lg:py-6 cursor-pointer list-none hover:bg-ink-50/40 transition-colors -mx-2 px-2 rounded-[6px]">
                      <h3 className="font-display text-[18px] lg:text-[21px] text-ink-800 tracking-[-0.015em] leading-snug break-keep">
                        {f.q}
                      </h3>
                      <ChevronDown
                        size={18}
                        strokeWidth={1.5}
                        className="mt-1.5 shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-180"
                      />
                    </summary>
                    <div className="pb-6 -mt-1 text-[14.5px] lg:text-[15px] text-ink-600 leading-[1.8] max-w-[680px] break-keep">
                      {renderAnswer(f.a)}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact card */}
        <div className="mt-14 lg:mt-16 rounded-[14px] border border-ink-200 bg-canvas/40 p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-display text-[18px] lg:text-[20px] text-ink-800 tracking-[-0.015em] mb-1">
              원하는 답변을 찾지 못하셨나요?
            </h3>
            <p className="text-[13.5px] text-ink-500 leading-[1.6]">
              이메일로 문의하시면 영업일 기준 1~2일 이내에 답변드립니다.
            </p>
          </div>
          <a
            href="mailto:support@wondercreative.kr"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] border border-ink-200 bg-paper text-[13px] font-medium text-ink-700 hover:border-ink-300 hover:text-ink-800 transition-colors shrink-0"
          >
            support@wondercreative.kr
            <ArrowRight size={13} strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Closing CTA
   ============================================================ */

export function ClosingCTA() {
  return (
    <section className="py-32 lg:py-40 border-t border-ink-200/60 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 50%, rgba(196, 211, 184, 0.30) 0%, rgba(251, 250, 247, 0) 70%)",
        }}
      />
      <div className="mx-auto max-w-[820px] px-6 lg:px-10 text-center">
        <h2
          className="font-display text-ink-800 mb-6 break-keep"
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            lineHeight: 1.25,
            letterSpacing: "-0.035em",
            fontWeight: 400,
          }}
        >
          이제, 브랜드의 영혼을
          <br />
          <span className="italic font-light" style={{ paddingRight: "0.12em" }}>
            콘텐츠로 옮길 시간
          </span>
          입니다
          <span className="text-anima-400">.</span>
        </h2>
        <p className="text-[16px] text-ink-500 mb-10 leading-[1.75] max-w-[560px] mx-auto break-keep">
          매일 "오늘 뭐 올리지?" 밤새 고민하던 스트레스는 끝내세요. Anima와 함께
          흔들리지 않는 우리 브랜드만의 팬덤을 만들어보세요.
        </p>
        <Link href="/login">
          <Button
            variant="primary"
            size="lg"
            trailingIcon={<ArrowRight size={16} strokeWidth={1.75} />}
          >
            지금 무료로 체험하기
          </Button>
        </Link>
      </div>
    </section>
  );
}

/* ============================================================
   Input vs Output — 소재만 던지면 Anima가 주제로
   ============================================================ */

const IO_EXAMPLES = [
  "3년 단골손님이 수줍게 건네준 캔커피 하나에 눈물 날 뻔한 사연",
  "오늘 아침 '커피에서 탄 맛 나요'라는 컴플레인을 반갑게 맞이한 이유",
  "퇴사하고 내 이름 석 자로 통장에 첫 10만 원이 찍혔을 때의 솔직한 기분",
];

export function InputOutput() {
  return (
    <section className="py-28 lg:py-36 border-t border-ink-200/60">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="Input → Output"
          title={
            <>
              당신은 '소재'만 던지세요.
              <br />
              멋진 문장은 Anima가 만듭니다.
            </>
          }
        />

        <div className="mt-16 lg:mt-20 max-w-[920px] mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-4 items-stretch">
          {/* Input */}
          <div className="rounded-[16px] border border-ink-200 bg-paper p-6 lg:p-7 flex flex-col">
            <p className="text-eyebrow text-ink-400 mb-4">📥 사용자 입력</p>
            <div className="flex-1 flex items-center">
              <div className="w-full rounded-[12px] bg-ink-50 border border-ink-200 px-4 py-5">
                <p className="font-mono text-[15px] text-ink-700">
                  3년 단골 캔커피
                </p>
                <span className="inline-block w-[2px] h-[18px] bg-anima-400 align-middle ml-0.5 animate-pulse" />
              </div>
            </div>
            <p className="text-[12px] text-ink-400 mt-4 leading-[1.6]">
              키워드 몇 개면 충분합니다.
            </p>
          </div>

          {/* Output */}
          <div className="rounded-[16px] border border-ink-800 bg-ink-800 text-ink-50 p-6 lg:p-7">
            <p className="text-eyebrow text-anima-300 mb-4">
              🪄 Anima의 제안
            </p>
            <ul className="space-y-3">
              {IO_EXAMPLES.map((ex) => (
                <li
                  key={ex}
                  className="flex items-start gap-3 rounded-[10px] bg-ink-900/40 border border-ink-700 px-4 py-3.5"
                >
                  <Sparkles
                    size={14}
                    strokeWidth={1.75}
                    className="text-anima-300 shrink-0 mt-0.5"
                  />
                  <span className="text-[13.5px] text-ink-100 leading-[1.6] break-keep">
                    {ex}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 text-center text-[15px] lg:text-[16px] text-ink-700 leading-[1.8] max-w-[640px] mx-auto break-keep">
          완벽한 카피를 쓰려고 쥐어짜 내지 마세요. 친구에게 카톡 보내듯 툭 던질 때,{" "}
          <span className="text-ink-900 font-medium">
            세상에 하나뿐인 진짜 우리 브랜드 스토리
          </span>
          가 탄생합니다.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   Trust Anchor — 자동 매크로가 아니라는 안심 장치
   ============================================================ */

export function TrustAnchor() {
  return (
    <section className="py-20 lg:py-24 border-t border-ink-200/60">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <div className="rounded-[20px] border border-ink-200 bg-canvas/50 px-7 py-10 lg:px-14 lg:py-14 text-center">
          <h2
            className="font-display text-ink-800 mb-5 break-keep"
            style={{
              fontSize: "clamp(26px, 3.4vw, 38px)",
              lineHeight: 1.3,
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            영혼 없이 피드를 도배하는
            <br />
            자동 매크로 프로그램이 아닙니다.
          </h2>
          <p className="text-[15px] lg:text-[16px] text-ink-600 leading-[1.85] max-w-[680px] mx-auto break-keep">
            Anima는 무분별하게 글을 양산하여 계정의 가치를 떨어뜨리지 않습니다.
            Anima가 완벽한 초안을 만들고,{" "}
            <span className="text-ink-900 font-medium">
              당신이 최종 결정권자(디렉터)로서 발행을 승인
            </span>
            합니다. 브랜드의 신뢰도를 안전하게 지키면서 가장 자연스러운 스토리를
            쌓아가세요.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Footer
   ============================================================ */

export function Footer() {
  return (
    <footer className="border-t border-ink-200/60 bg-canvas/40">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-baseline gap-2.5 mb-3">
              <Logo variant="lockup" size={26} />
              <span className="text-[12px] text-ink-300 italic tracking-[0.04em]">
                for Thread
              </span>
            </div>
            <p
              className="font-sans text-ink-500"
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                letterSpacing: "-0.005em",
                fontWeight: 400,
              }}
            >
              페르소나 기반 콘텐츠 스튜디오.
            </p>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "작동 방식", href: "#how" },
              { label: "요금제", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "소개", href: "#" },
              { label: "블로그", href: "#" },
              { label: "문의", href: "mailto:support@wondercreative.kr" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "이용약관", href: "/terms" },
              { label: "개인정보처리방침", href: "/privacy" },
              { label: "환불정책", href: "/refund" },
            ]}
          />
        </div>

        {/* Business info — required by Korean e-commerce law */}
        <div className="mt-14 pt-8 border-t border-ink-200/60">
          <p className="text-eyebrow text-ink-400 mb-3">Business</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-[11.5px] leading-[1.6]">
            <BizField label="상호" value="원더크리에이티브" />
            <BizField label="대표자" value="이원준" />
            <BizField label="사업자등록번호" value="678-37-00662" />
            <BizField
              label="통신판매업 신고번호"
              value="2019-서울용산-1033"
            />
            <BizField
              label="사업장 소재지"
              value="서울특별시 용산구 신흥로 25 B1F"
              wide
            />
            <BizField
              label="고객 문의"
              value="support@wondercreative.kr"
              link="mailto:support@wondercreative.kr"
            />
          </dl>
        </div>

        <div className="mt-10 pt-6 border-t border-ink-200/60 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <p className="text-[12px] text-ink-400 font-mono tracking-[0.02em]">
            © 2026 WONDERCREATIVE. All rights reserved.
          </p>
          <p className="text-[11px] text-ink-400 italic">
            Brought to life with breath, ink, and the occasional silence.
          </p>
        </div>
      </div>
    </footer>
  );
}

function BizField({
  label,
  value,
  link,
  wide = false,
}: {
  label: string;
  value: string;
  link?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline gap-3 min-w-0 ${
        wide ? "lg:col-span-2" : ""
      }`}
    >
      <dt className="text-ink-400 shrink-0 w-[100px] sm:w-[120px]">
        {label}
      </dt>
      <dd className="text-ink-600 truncate">
        {link ? (
          <a
            href={link}
            className="hover:text-ink-800 transition-colors"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-eyebrow text-ink-400 mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => {
          const isInternal = l.href.startsWith("/");
          const className =
            "text-[13px] text-ink-600 hover:text-ink-800 transition-colors";
          return (
            <li key={l.label}>
              {isInternal ? (
                <Link href={l.href} className={className}>
                  {l.label}
                </Link>
              ) : (
                <a href={l.href} className={className}>
                  {l.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================
   Shared
   ============================================================ */

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  theme = "light",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  return (
    <div
      className={`max-w-[680px] ${
        align === "center" ? "mx-auto text-center" : ""
      }`}
    >
      <p
        className={`text-eyebrow mb-5 ${
          isDark ? "text-anima-300" : "text-anima-600"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`font-display mb-5 break-keep ${
          isDark ? "text-ink-50" : "text-ink-800"
        }`}
        style={{
          fontSize: "clamp(30px, 4.2vw, 48px)",
          lineHeight: 1.3,
          letterSpacing: "-0.03em",
          fontWeight: 400,
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-[15px] sm:text-[16px] leading-[1.75] break-keep ${
            isDark ? "text-ink-300" : "text-ink-500"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
