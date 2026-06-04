"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, Pencil } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { generateId } from "@/app/lib/supabase-storage";
import { Channel, WorldBuilding } from "@/app/types";
import { Logo } from "@/app/components/brand/Logo";
import { Button } from "@/app/components/ui/Button";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { PlanPickerModal } from "@/app/components/app/PlanPickerModal";
import { PersonaInterview } from "@/app/components/app/persona/PersonaInterview";
import type { PlanId } from "@/app/lib/billing";

const defaultWorldBuilding: WorldBuilding = {
  basic: { name: "", age: undefined, job: "", appearance: "", oneline: "" },
  personality: {
    traits: "",
    expressions: [],
    speechPattern: "",
    forbiddenWords: [],
  },
  world: { background: "", interests: [], values: "", dailyRoutine: "" },
  contentDirection: {
    mainTopics: [],
    sellWhat: "",
    message: "",
    forbiddenTopics: [],
  },
  targetAudience: { description: "", ageGroup: "", interests: "", toneTip: "" },
  tone: { seriousness: 5, professionalism: 5, formality: 5, depth: 5 },
  examples: [],
  forbiddenThings: "",
};

type Mode = "pick" | "interview" | "manual";

export default function NewPersonaPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [mode, setMode] = useState<Mode>("pick");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [planPickerOpen, setPlanPickerOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");

  // Manual-mode form state
  const [name, setName] = useState("");

  useEffect(() => {
    const check = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user?.email) {
          router.push("/login");
          return;
        }
        setUser(session.user);
      } catch (e) {
        console.error(e);
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };
    check();
  }, [router]);

  /**
   * Create the channel via the limit-enforced API. On 403 PERSONA_LIMIT,
   * pop the plan picker. Returns the created channel id, or null on error.
   */
  const createChannel = async (worldBuilding: WorldBuilding, displayName: string) => {
    const newChannel: Channel = {
      id: generateId("ch"),
      name: displayName,
      thumbnail: undefined,
      activeCategories: ["Thread"],
      createdAt: new Date().toISOString(),
      worldBuilding,
    };

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ channel: newChannel }),
    });

    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      if (data?.error === "PERSONA_LIMIT") {
        setCurrentPlan((data.plan as PlanId) ?? "free");
        setPlanPickerOpen(true);
        setError(
          `현재 플랜(${data.plan ?? "free"})은 페르소나 ${data.limit}개까지 만들 수 있어요. 더 만들려면 플랜을 업그레이드하세요.`
        );
        return null;
      }
    }
    if (!res.ok) {
      throw new Error("CREATE_FAILED");
    }
    return newChannel.id;
  };

  const handleManualCreate = async () => {
    setError("");
    if (!name.trim()) {
      setError("페르소나 이름을 입력해주세요.");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      const wb: WorldBuilding = {
        ...defaultWorldBuilding,
        basic: { ...defaultWorldBuilding.basic, name: name.trim() },
      };
      const id = await createChannel(wb, name.trim());
      if (id) router.push(`/channels/${id}/worldbuilding`);
    } catch (e) {
      console.error(e);
      setError("페르소나 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInterviewComplete = async ({
    worldBuilding,
    filledKeys,
  }: {
    worldBuilding: WorldBuilding;
    filledKeys: string[];
  }) => {
    if (!user) return;
    setSubmitting(true);
    setError("");
    try {
      const id = await createChannel(
        worldBuilding,
        worldBuilding.basic.name || "새 페르소나"
      );
      if (id) {
        // Stash filledKeys so the worldbuilding page can mark AI-filled fields.
        try {
          sessionStorage.setItem(
            `persona-filled-keys:${id}`,
            JSON.stringify(filledKeys)
          );
        } catch {
          // sessionStorage may be unavailable; markers just won't show.
        }
        router.push(`/channels/${id}/worldbuilding?reviewing=1`);
      }
    } catch (e) {
      console.error(e);
      setError("페르소나 저장에 실패했어요. 다시 시도해주세요.");
      setMode("interview");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-paper p-10">
        <Skeleton className="h-6 w-24 mb-10" />
        <Skeleton className="h-10 w-72 mb-3" />
        <Skeleton className="h-5 w-96 mb-10" />
        <Skeleton className="h-12 w-full max-w-[520px] mb-3" />
        <Skeleton className="h-32 w-full max-w-[520px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="h-16 px-6 lg:px-10 flex items-center justify-between border-b border-ink-200/60">
        <Link
          href="/channels"
          className="flex items-center gap-2 text-ink-500 hover:text-ink-800 transition-colors text-[13px]"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span>페르소나 목록</span>
        </Link>
        <div className="flex items-baseline gap-2">
          <Logo variant="lockup" size={20} />
          <span className="text-[10px] text-ink-300 italic tracking-[0.04em] hidden sm:inline">
            for Thread
          </span>
        </div>
        <div className="w-[110px]" />
      </header>

      <main className="flex-1 px-6 lg:px-10">
        {mode === "pick" && (
          <ModePicker
            onPickInterview={() => {
              setError("");
              setMode("interview");
            }}
            onPickManual={() => {
              setError("");
              setMode("manual");
            }}
          />
        )}

        {mode === "interview" && (
          <PersonaInterview
            onComplete={handleInterviewComplete}
            onBack={() => setMode("pick")}
          />
        )}

        {mode === "manual" && (
          <ManualForm
            name={name}
            setName={setName}
            error={error}
            submitting={submitting}
            onCreate={handleManualCreate}
            onBack={() => setMode("pick")}
          />
        )}

        {error && mode !== "manual" && (
          <p className="text-center text-[12.5px] text-[#7c3a31] mt-4">
            {error}
          </p>
        )}
      </main>

      <PlanPickerModal
        open={planPickerOpen}
        onClose={() => setPlanPickerOpen(false)}
        currentPlan={currentPlan}
      />
    </div>
  );
}

function ModePicker({
  onPickInterview,
  onPickManual,
}: {
  onPickInterview: () => void;
  onPickManual: () => void;
}) {
  return (
    <div className="max-w-[640px] mx-auto py-12 lg:py-16">
      <p className="text-eyebrow text-anima-600 mb-3">New persona</p>
      <h1
        className="font-display text-ink-800 mb-3"
        style={{
          fontSize: "clamp(28px, 3.5vw, 40px)",
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          fontWeight: 400,
        }}
      >
        어떻게 페르소나를
        <br />
        만들어볼까요?
      </h1>
      <p className="text-[14px] text-ink-500 leading-[1.7] mb-10 max-w-[520px]">
        Anima와 짧게 인터뷰하면 8개 섹션이 자동으로 채워진 초안을 받을 수
        있어요. 직접 채우고 싶으시면 빈 양식으로 시작하셔도 됩니다.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onPickInterview}
          className="group text-left rounded-[14px] border border-ink-800 bg-ink-800 text-ink-50 p-6 transition-all hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-anima-300 focus:ring-offset-2 focus:ring-offset-paper"
        >
          <div className="flex items-center gap-2 mb-3 text-anima-200">
            <Sparkles size={14} strokeWidth={1.75} />
            <p className="text-[10.5px] tracking-[0.1em] uppercase font-medium">
              Recommended
            </p>
          </div>
          <h3 className="font-display text-[20px] tracking-[-0.02em] text-ink-50 mb-2">
            Anima와 함께 만들기
          </h3>
          <p className="text-[12.5px] text-ink-300 leading-[1.65] mb-5">
            짧은 객관식 설문에 답하면 8섹션이 채워진 초안을 받아요. 그다음에
            검토하고 다듬으세요. 5~7분이면 충분합니다.
          </p>
          <p className="text-[11px] text-anima-200/90 mb-5">
            저장 후에도 언제든 수정 가능.
          </p>
          <div className="inline-flex items-center gap-1.5 text-[12.5px] text-anima-200 group-hover:gap-2 transition-all">
            시작하기
            <ArrowRight size={13} strokeWidth={1.75} />
          </div>
        </button>

        <button
          onClick={onPickManual}
          className="group text-left rounded-[14px] border border-ink-200 bg-paper p-6 transition-all hover:border-ink-300 focus:outline-none focus:ring-2 focus:ring-ink-300 focus:ring-offset-2 focus:ring-offset-paper"
        >
          <div className="flex items-center gap-2 mb-3 text-ink-400">
            <Pencil size={13} strokeWidth={1.75} />
            <p className="text-[10.5px] tracking-[0.1em] uppercase font-medium">
              Manual
            </p>
          </div>
          <h3 className="font-display text-[20px] tracking-[-0.02em] text-ink-800 mb-2">
            직접 채우기
          </h3>
          <p className="text-[12.5px] text-ink-500 leading-[1.65] mb-5">
            빈 양식에서 시작합니다. 8섹션을 차근차근 직접 채우고 싶으시거나,
            이미 명확한 페르소나가 있으실 때.
          </p>
          <p className="text-[11px] text-ink-400 mb-5">
            잉크 차감 없음.
          </p>
          <div className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-700 group-hover:gap-2 transition-all">
            빈 양식으로 시작
            <ArrowRight size={13} strokeWidth={1.75} />
          </div>
        </button>
      </div>
    </div>
  );
}

function ManualForm({
  name,
  setName,
  error,
  submitting,
  onCreate,
  onBack,
}: {
  name: string;
  setName: (n: string) => void;
  error: string;
  submitting: boolean;
  onCreate: () => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-[520px] mx-auto py-12 lg:py-16">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 hover:text-ink-800 transition-colors mb-6"
      >
        <ArrowLeft size={12} strokeWidth={1.75} />
        다른 방식으로
      </button>

      <p className="text-eyebrow text-anima-600 mb-3">Manual</p>
      <h1
        className="font-display text-ink-800 mb-3"
        style={{
          fontSize: "clamp(28px, 3.5vw, 40px)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          fontWeight: 400,
        }}
      >
        페르소나의
        <br />
        이름부터 정해주세요.
      </h1>
      <p className="text-[14px] text-ink-500 leading-[1.7] mb-8">
        이름만 정해도 시작할 수 있어요. 다음 화면에서 8개 섹션을 직접
        채우게 됩니다.
      </p>

      <label className="block text-[12.5px] text-ink-600 font-medium mb-2">
        이름
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCreate();
          }
        }}
        placeholder="예. 도원"
        className="w-full h-12 px-3.5 bg-paper border border-ink-200 rounded-[8px] text-[15px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink-700 transition-colors mb-3"
      />

      {error && (
        <div className="px-3.5 py-2.5 rounded-[8px] bg-[rgba(181,86,74,0.08)] border border-[rgba(181,86,74,0.20)] mb-4">
          <p className="text-[12.5px] text-[#7c3a31] leading-[1.5]">
            {error}
          </p>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        onClick={onCreate}
        disabled={submitting || !name.trim()}
        trailingIcon={<ArrowRight size={15} strokeWidth={1.75} />}
        className="w-full mt-2"
      >
        {submitting ? "생성 중…" : "다음 — 페르소나 빚기"}
      </Button>
    </div>
  );
}
