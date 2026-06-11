import {
  ArrowRight,
  ArrowDown,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
  CheckCircle2,
} from "lucide-react";

// 왼쪽 패널 단계 카드용 헬퍼
function StepBadge({ n }: { n: string }) {
  return (
    <span className="w-6 h-6 rounded-full bg-anima-600 text-paper text-[10.5px] font-semibold tabular-nums flex items-center justify-center shrink-0">
      {n}
    </span>
  );
}

function AnalysisRow({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-[8px] border px-2.5 py-1.5 ${
        danger
          ? "border-[rgba(181,86,74,0.25)] bg-[rgba(181,86,74,0.05)]"
          : "border-anima-200 bg-anima-50/40"
      }`}
    >
      <p
        className={`text-[9px] font-semibold tracking-[0.06em] uppercase mb-0.5 ${
          danger ? "text-[#9c4a3f]" : "text-anima-700"
        }`}
      >
        {label}
      </p>
      <p className="text-[11px] text-ink-700 leading-snug break-keep">
        {value}
      </p>
    </div>
  );
}

const POSTS = [
  {
    order: 1,
    text: `나 에스프레소 머신 없는 카페 열겠다고 했을 때,\n다들 미쳤다고 말렸잖아.\n\n회전율 안 나와서 석 달 안에 무조건 망한다고.\n\n근데 난 그냥 손님이랑 눈 마주치면서\n천천히 커피 내리는 그 속도가 참 좋았어.\n\n뻔한 효율 때문에\n내 철학을 버리고 싶진 않았거든.`,
  },
  {
    order: 2,
    text: `당연히 첫 달 매출은 진짜 처참했지.\n하루에 딱 다섯 잔 판 날도 있었으니까.\n\n근데 신기한 건,\n그렇게 느리게 내린 커피 한 잔을 마시고 간 사람들은\n다음 주에 꼭 친구 손을 잡고 다시 오더라고.\n\n느린 게 단점인 줄 알았는데,\n오히려 우리만의 뾰족한 무기가 된 거야.`,
  },
  {
    order: 3,
    text: `다들 너무 빠르게만 가려니까\n쉽게 지치는 게 아닐까?\n\n가끔은 일부러 속도를 조금 늦춰봐야\n비로소 보이는 것들이 있거든.\n단골들 표정이나 오늘 날씨 같은 소중한 것들 말이야.\n\n너희 브랜드나 일상에도\n일부러 조금 늦춰둔 너만의 속도가 있어?`,
  },
];

const REPLIES = [
  {
    handle: "coffee_traveler",
    avatar: "C",
    avatarBg: "#b89580",
    time: "2시간",
    text: "아 대박.. 자주 가는데 에스프레소 머신 없는 줄 이제 알았음.. 갈 때마다 편안해서 좋아",
    likes: 42,
  },
  {
    handle: "min_zi_log",
    avatar: "M",
    avatarBg: "#a37e8b",
    time: "4시간",
    text: "나도 프리랜서 시작하고 남들보다 너무 뒤쳐지는 거 같아서 맨날 조급했는데 글 읽다가 갑자기 울컥한다ㅠㅠ",
    likes: 28,
  },
  {
    handle: "zero_waste_life",
    avatar: "Z",
    avatarBg: "#6b8aa8",
    time: "5시간",
    text: "진짜 요즘 죄다 효율 거리면서 공장처럼 찍어내는곳 천지라 피로했는데.. 이런 고집 너무 좋음",
    likes: 56,
  },
  {
    handle: "weekend_hunter",
    avatar: "W",
    avatarBg: "#7a8b6d",
    time: "7시간",
    text: "난 회사 때려치우고 일부러 1년 동안 아무것도 안 하고 쉬는 중이야 ,,ㅠㅠ 꼭 한번 놀러갈게",
    likes: 19,
  },
];

/* ============================================================
   AppPreview — desktop side-by-side, mobile carousel
   ============================================================ */

export function AppPreview() {
  return (
    <>
      {/* Desktop — side by side */}
      <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-stretch">
        <AnimaSide />
        <Connector />
        <ThreadsSide />
      </div>

      {/* Mobile — vertical stack (위→아래로 내려감) */}
      <div className="lg:hidden">
        <p className="mb-2.5 text-center text-[11px] text-anima-700 font-medium tracking-[0.04em]">
          ① 브랜드 페르소나를 설계하면
        </p>
        <AnimaSide />

        <VerticalConnector />

        <ThreadsSide />
        <p className="mt-2.5 text-center text-[11px] text-anima-700 font-medium tracking-[0.04em]">
          ② Threads 콘텐츠로 완성됩니다
        </p>
      </div>
    </>
  );
}

/* ============================================================
   Connector
   ============================================================ */

function VerticalConnector() {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <span className="text-[9.5px] tracking-[0.12em] uppercase text-ink-400 font-medium">
        publish
      </span>
      <span
        className="w-9 h-9 rounded-full border border-ink-200 bg-paper flex items-center justify-center text-ink-700"
        style={{ boxShadow: "0 4px 12px rgba(11, 10, 7, 0.06)" }}
      >
        <ArrowDown size={15} strokeWidth={1.75} />
      </span>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex items-center justify-center px-3">
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] tracking-[0.12em] uppercase text-ink-400 font-medium">
          publish
        </span>
        <span
          className="w-10 h-10 rounded-full border border-ink-200 bg-paper flex items-center justify-center text-ink-700"
          style={{
            boxShadow: "0 4px 12px rgba(11, 10, 7, 0.06)",
          }}
        >
          <ArrowRight size={16} strokeWidth={1.75} />
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   LEFT: Anima content workspace
   ============================================================ */

function AnimaSide() {
  return (
    <div
      className="relative rounded-[16px] border border-ink-200/80 bg-paper overflow-hidden h-full"
      style={{
        boxShadow:
          "0 24px 60px rgba(11, 10, 7, 0.08), 0 8px 16px rgba(11, 10, 7, 0.04)",
      }}
    >
      <div className="p-5 lg:p-6 min-w-0 text-center">
        {/* 01 기본 정보 */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <StepBadge n="01" />
            <p className="text-[13px] font-semibold text-ink-800">기본 정보</p>
          </div>
          <div className="space-y-1.5">
            <AnalysisRow label="브랜드" value="누크 커피 · 성수동 필터커피" />
            <AnalysisRow
              label="한 줄 소개"
              value="에스프레소 머신 없이 천천히 내리는 필터커피"
            />
          </div>
        </div>

        {/* 02 성격과 말투 */}
        <div className="mt-4 pt-4 border-t border-ink-200/60">
          <div className="flex items-center justify-center gap-2 mb-2">
            <StepBadge n="02" />
            <p className="text-[13px] font-semibold text-ink-800">성격과 말투</p>
          </div>
          <div className="space-y-1.5">
            <AnalysisRow
              label="자주 쓰는 패턴"
              value={'"~했어 · ~잖아" · "근데 신기한 건"'}
            />
            <AnalysisRow
              label="지양 표현"
              value={'광고체 "~하세요!" · 번역체'}
              danger
            />
          </div>
        </div>

        {/* 생략 — 세로 점 */}
        <div
          className="my-4 flex flex-col items-center gap-1 animate-pulse"
          aria-hidden
        >
          <span className="w-1 h-1 rounded-full bg-ink-300" />
          <span className="w-1 h-1 rounded-full bg-ink-300" />
          <span className="w-1 h-1 rounded-full bg-ink-300" />
        </div>

        {/* 08 콘텐츠 방향 */}
        <div className="mt-4 pt-4 border-t border-ink-200/60">
          <div className="flex items-center justify-center gap-2 mb-2">
            <StepBadge n="08" />
            <p className="text-[13px] font-semibold text-ink-800">콘텐츠 방향</p>
          </div>
          <div className="space-y-1.5">
            <AnalysisRow
              label="주요 소재"
              value="필터커피 고집하는 이유 · 운영 시행착오 · 단골과의 일상"
            />
            <AnalysisRow
              label="핵심 메시지"
              value="효율에 쫓기지 말고, 우리만의 속도로"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   RIGHT: Threads feed mock
   ============================================================ */

function ThreadsSide() {
  return (
    <div
      className="relative rounded-[16px] border border-ink-200/80 bg-paper overflow-hidden h-full"
      style={{
        boxShadow:
          "0 24px 60px rgba(11, 10, 7, 0.08), 0 8px 16px rgba(11, 10, 7, 0.04)",
      }}
    >
      {/* Window chrome */}
      <div className="h-9 border-b border-ink-200/60 bg-ink-50 flex items-center px-4 gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="ml-4 text-[11px] text-ink-400 tracking-[0.02em] truncate">
          threads.com / @nook.coffee
        </span>
      </div>

      <div className="p-5 lg:p-6 min-w-0">
        {/* Author header */}
        <div className="flex items-start gap-3 mb-3">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-display text-ink-50 shrink-0"
            style={{ background: "#7a8b6d" }}
          >
            N
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-ink-800 leading-tight">
                nook.coffee
              </p>
              <CheckCircle2
                size={12}
                strokeWidth={2}
                className="text-anima-500"
                aria-label="verified"
              />
              <span className="text-[11px] text-ink-400 leading-tight">
                · 4시간
              </span>
            </div>
            <p className="text-[11px] text-ink-400 leading-tight mt-0.5">
              누크 커피 · 성수동 필터커피 카페
            </p>
          </div>
          <MoreHorizontal
            size={14}
            strokeWidth={1.75}
            className="text-ink-400 shrink-0 mt-1"
          />
        </div>

        {/* Thread chain — all 3 posts */}
        <ol className="relative space-y-3 mb-4">
          {/* Chain line connecting posts */}
          <span
            aria-hidden
            className="absolute left-[5px] top-2 bottom-2 w-px bg-ink-200"
          />
          {POSTS.map((p, i) => (
            <li
              key={p.order}
              className="relative pl-5"
            >
              <span
                aria-hidden
                className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full bg-paper border-2 border-ink-300"
              />
              <p
                className={`text-[12.5px] leading-[1.65] whitespace-pre-line ${
                  i === 0 ? "text-ink-800 font-medium" : "text-ink-700"
                }`}
              >
                {p.text}
              </p>
            </li>
          ))}
        </ol>

        {/* Engagement bar */}
        <div className="flex items-center gap-5 py-2 border-y border-ink-200/60 mb-4">
          <EngagementMetric icon={Heart} value="2,143" filled />
          <EngagementMetric icon={MessageCircle} value="186" />
          <EngagementMetric icon={Repeat2} value="412" />
          <EngagementMetric icon={Send} value="89" />
        </div>

        {/* Replies */}
        <div className="space-y-3.5">
          <p className="text-[10.5px] text-ink-400 tracking-[0.08em] uppercase font-medium">
            답글
          </p>
          {REPLIES.map((r) => (
            <article
              key={r.handle}
              className="flex items-start gap-2.5 min-w-0"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium text-ink-50 shrink-0"
                style={{ background: r.avatarBg }}
              >
                {r.avatar}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-[11.5px] font-semibold text-ink-800 truncate">
                    {r.handle}
                  </p>
                  <span className="text-[10.5px] text-ink-400 shrink-0">
                    · {r.time}
                  </span>
                </div>
                <p className="text-[12px] text-ink-700 leading-[1.55] whitespace-pre-line">
                  {r.text}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[10.5px] text-ink-400">
                    <Heart size={10} strokeWidth={1.75} />
                    <span className="tabular-nums">{r.likes}</span>
                  </span>
                  <span className="text-[10.5px] text-ink-400">답글</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function EngagementMetric({
  icon: Icon,
  value,
  filled = false,
}: {
  icon: React.ElementType;
  value: string;
  filled?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-500">
      <Icon
        size={13}
        strokeWidth={1.75}
        className={filled ? "text-[#b5564a] fill-[#b5564a]" : ""}
      />
      <span className="tabular-nums font-medium">{value}</span>
    </span>
  );
}
