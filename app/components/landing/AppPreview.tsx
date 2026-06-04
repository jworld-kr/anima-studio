"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";

const TOPIC = "3년 카페 운영하면서 깨달은, 손님이 절대 모르는 원두의 진실";

const POSTS = [
  {
    order: 1,
    text: `3년 카페 하면서 깨달은 거.\n\n손님 80%는 원두 살 때 가장 중요한 걸 안 봄.\n\n산지도, 가격도 아님 ㅋㅋ`,
  },
  {
    order: 2,
    text: `정답은 로스팅 날짜.\n\n1주일 지난 원두랑 한 달 지난 원두는 진짜 완전 다른 음료라고 보면 됨.\n\n근데 마트나 온라인에서 파는 원두 중 60%는 로스팅 날짜 표기 안 함.`,
  },
  {
    order: 3,
    text: `원두 살 때 무조건 확인하기:\n\n✅ 로스팅 날짜 (없으면 의심)\n✅ 산 후 5~10일 안에 마시기\n✅ 못 마실 양은 차라리 100g만 사기\n\n스친들은 원두 살 때 뭐 제일 먼저 봐? 댓글로 알려줘 🙏`,
  },
];

const REPLIES = [
  {
    handle: "soohyun_brews",
    avatar: "S",
    avatarBg: "#b89580",
    time: "2시간",
    text: "와 진짜 로스팅 날짜 한 번도 안 봤네요... 다음엔 꼭 확인해볼게요 🙇‍♀️",
    likes: 89,
  },
  {
    handle: "minji.kafee",
    avatar: "M",
    avatarBg: "#a37e8b",
    time: "1시간",
    text: "60%가 표기 안 한다는 거 충격이에요,, 사장님 글 덕에 오늘 원두 다시 보러 갑니다 ☕️",
    likes: 47,
  },
  {
    handle: "everyday_drip",
    avatar: "E",
    avatarBg: "#6b8aa8",
    time: "47분",
    text: "100g씩만 사라는 거 진짜 공감 ㅋㅋ 저도 큰 거 사놓고 한 달 묵힌 적 있음 ㅠ",
    likes: 32,
  },
  {
    handle: "kim_baker",
    avatar: "K",
    avatarBg: "#7a8b6d",
    time: "23분",
    text: "다음 글 언제 올라와요? 산지별 차이도 궁금해요!!",
    likes: 18,
  },
];

/* ============================================================
   AppPreview — desktop side-by-side, mobile carousel
   ============================================================ */

export function AppPreview() {
  const [page, setPage] = useState(0); // 0 = Anima, 1 = Threads
  const isPausedRef = useRef(false);
  const startXRef = useRef<number | null>(null);

  // Auto-advance on mobile
  useEffect(() => {
    const id = window.setInterval(() => {
      if (isPausedRef.current) return;
      setPage((p) => (p + 1) % 2);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  // Swipe handling — transform-based carousel
  const onTouchStart = (e: React.TouchEvent) => {
    isPausedRef.current = true;
    startXRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const startX = startXRef.current;
    startXRef.current = null;
    if (startX !== null) {
      const endX = e.changedTouches[0].clientX;
      const delta = endX - startX;
      const threshold = 50; // px
      if (Math.abs(delta) > threshold) {
        if (delta < 0 && page === 0) setPage(1);
        else if (delta > 0 && page === 1) setPage(0);
      }
    }
    // Resume auto-advance after a pause
    window.setTimeout(() => {
      isPausedRef.current = false;
    }, 4000);
  };

  return (
    <>
      {/* Desktop — side by side */}
      <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-stretch">
        <AnimaSide />
        <Connector />
        <ThreadsSide />
      </div>

      {/* Mobile — transform carousel */}
      <div className="lg:hidden">
        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            <div className="shrink-0 w-full px-px">
              <AnimaSide />
            </div>
            <div className="shrink-0 w-full px-px">
              <ThreadsSide />
            </div>
          </div>
        </div>

        {/* Dots + label */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              isPausedRef.current = true;
              setPage(0);
              window.setTimeout(() => {
                isPausedRef.current = false;
              }, 4000);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              page === 0 ? "w-6 bg-ink-800" : "w-1.5 bg-ink-300"
            }`}
            aria-label="Anima 화면"
          />
          <button
            onClick={() => {
              isPausedRef.current = true;
              setPage(1);
              window.setTimeout(() => {
                isPausedRef.current = false;
              }, 4000);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              page === 1 ? "w-6 bg-ink-800" : "w-1.5 bg-ink-300"
            }`}
            aria-label="Threads 화면"
          />
        </div>
        <p className="mt-3 text-center text-[11px] text-ink-400 tracking-[0.04em]">
          {page === 0
            ? "Anima에서 만들고"
            : "Threads에서 반응을 받습니다"}
        </p>
      </div>
    </>
  );
}

/* ============================================================
   Connector
   ============================================================ */

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
      {/* Window chrome */}
      <div className="h-9 border-b border-ink-200/60 bg-ink-50 flex items-center px-4 gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="ml-4 text-[11px] text-ink-400 tracking-[0.02em] truncate">
          anima.studio / 반도커피
        </span>
      </div>

      <div className="p-5 lg:p-6 min-w-0">
        {/* Persona row */}
        <div className="flex items-center gap-2.5 mb-5">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-display text-ink-50 shrink-0"
            style={{ background: "#7a8b6d" }}
          >
            半
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-ink-800 leading-tight">
              반도커피
            </p>
            <p className="text-[10.5px] text-ink-400 leading-tight mt-0.5">
              가게 페르소나 · Thread
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-anima-700">
            <Sparkles size={11} strokeWidth={1.75} />
            <span className="font-medium">생성됨</span>
          </div>
        </div>

        {/* Topic */}
        <div className="border border-ink-200 rounded-[10px] p-3 mb-3 bg-ink-50/50">
          <p className="text-[10px] text-ink-400 tracking-[0.12em] uppercase mb-1">
            주제
          </p>
          <p className="text-[12.5px] text-ink-700 leading-snug">{TOPIC}</p>
        </div>

        {/* Posts */}
        <ol className="space-y-2">
          {POSTS.map((p, i) => (
            <li key={p.order}>
              <article
                className={`rounded-[10px] border p-3 ${
                  i === 0
                    ? "border-anima-300 bg-anima-50/40"
                    : "border-ink-200 bg-paper"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-[9.5px] text-ink-400 tabular-nums mt-0.5 shrink-0">
                    0{p.order}
                  </span>
                  <p className="text-[11.5px] text-ink-700 leading-[1.6] whitespace-pre-line flex-1 min-w-0">
                    {p.text}
                  </p>
                  <div className="flex flex-col gap-1 opacity-60 shrink-0">
                    <Pencil
                      size={10}
                      strokeWidth={1.5}
                      className="text-ink-400"
                    />
                    <Trash2
                      size={10}
                      strokeWidth={1.5}
                      className="text-ink-400"
                    />
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-ink-200/60 flex items-center justify-between">
          <p className="text-[10.5px] text-ink-400 leading-tight">
            반도커피 페르소나의 톤으로 작성됨
          </p>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-ink-800 text-ink-50 text-[10.5px] font-medium">
            <Send size={10} strokeWidth={1.75} />
            발행하기
          </span>
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
          threads.com / @bando.coffee
        </span>
      </div>

      <div className="p-5 lg:p-6 min-w-0">
        {/* Author header */}
        <div className="flex items-start gap-3 mb-3">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-display text-ink-50 shrink-0"
            style={{ background: "#7a8b6d" }}
          >
            半
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-ink-800 leading-tight">
                bando.coffee
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
              반도커피 · 1인 카페 · 마이크로 로스터리
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
