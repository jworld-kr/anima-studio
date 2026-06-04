"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Save, Sparkles, X } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { channelStorage } from "@/app/lib/supabase-storage";
import { Channel, WorldBuilding } from "@/app/types";
import { Logo } from "@/app/components/brand/Logo";
import { Button } from "@/app/components/ui/Button";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { ToastProvider, useToast } from "@/app/components/ui/Toast";
import { PersonaBuilder } from "@/app/components/app/persona/PersonaBuilder";
import { personaColor, personaInitial } from "@/app/lib/personaColor";

export default function WorldBuildingPage() {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
}

function Inner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const channelId = params.id as string;
  const { toast } = useToast();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [filledCount, setFilledCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user?.email) {
          router.push("/login");
          return;
        }
        const ch = await channelStorage.getChannel(channelId);
        if (ch) setChannel(ch);
        else router.push("/channels");
      } catch (e) {
        console.error(e);
        router.push("/channels");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [channelId, router]);

  // Detect AI-review mode and load filledKeys from sessionStorage.
  useEffect(() => {
    if (searchParams.get("reviewing") !== "1") return;
    setReviewing(true);
    try {
      const raw = sessionStorage.getItem(`persona-filled-keys:${channelId}`);
      if (raw) {
        const keys = JSON.parse(raw);
        if (Array.isArray(keys)) setFilledCount(keys.length);
      }
    } catch {
      // ignore
    }
  }, [channelId, searchParams]);

  const dismissReviewBanner = () => {
    setReviewing(false);
    try {
      sessionStorage.removeItem(`persona-filled-keys:${channelId}`);
    } catch {
      // ignore
    }
    // Clear ?reviewing=1 from the URL so refresh doesn't bring it back.
    router.replace(`/channels/${channelId}/worldbuilding`);
  };

  const handleSave = async () => {
    if (!channel) return;
    setIsSaving(true);
    try {
      await channelStorage.updateChannel(channelId, {
        worldBuilding: channel.worldBuilding,
      });
      toast({
        title: "저장되었습니다",
        description: "페르소나가 업데이트되었습니다.",
        variant: "success",
      });
    } catch (e) {
      console.error(e);
      toast({ description: "저장에 실패했습니다.", variant: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = (updated: WorldBuilding) => {
    if (channel) setChannel({ ...channel, worldBuilding: updated });
  };

  if (isLoading || !channel) {
    return (
      <div className="min-h-screen bg-paper p-10">
        <Skeleton className="h-6 w-24 mb-10" />
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-5 w-96 mb-10" />
        <Skeleton className="h-[400px] w-full max-w-[760px]" />
      </div>
    );
  }

  const accent = personaColor(channel.id);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top bar */}
      <header className="h-16 px-6 lg:px-10 flex items-center justify-between border-b border-ink-200 bg-paper sticky top-0 z-30">
        <Link
          href="/channels"
          className="flex items-center gap-2 text-ink-500 hover:text-ink-800 transition-colors text-[13px]"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span className="hidden sm:inline">페르소나 목록</span>
        </Link>
        <div className="flex items-baseline gap-2">
          <Logo variant="lockup" size={18} />
          <span className="text-[10px] text-ink-300 italic tracking-[0.04em] hidden sm:inline">
            for Thread
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          leadingIcon={<Save size={13} strokeWidth={1.75} />}
        >
          {isSaving
            ? "저장 중…"
            : reviewing
            ? "이대로 페르소나 완성하기 ✨"
            : "저장"}
        </Button>
      </header>

      {/* Page header */}
      <div className="px-6 lg:px-10 pt-10 lg:pt-12 pb-6 border-b border-ink-200">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-display text-ink-50 shrink-0 mt-1"
              style={{ background: accent }}
            >
              {personaInitial(channel.name)}
            </span>
            <div className="min-w-0">
              <p className="text-eyebrow text-anima-600 mb-1.5">
                Persona builder
              </p>
              <h1
                className="font-display text-ink-800 truncate"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  fontWeight: 400,
                }}
              >
                {channel.name || "이름 없는 페르소나"}
              </h1>
              <p className="text-[14px] text-ink-500 mt-2 leading-[1.6] max-w-[600px]">
                8개의 섹션을 통해 브랜드에 생명을 불어넣을 수 있습니다.
                <br />
                일관된 콘텐츠를 생성할 수 있도록 페르소나를 완성해 주세요.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
            <Link href={`/dashboard/${channelId}`}>
              <Button
                variant="secondary"
                size="md"
                trailingIcon={<ArrowRight size={13} strokeWidth={1.75} />}
              >
                대시보드 열기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* AI review banner */}
      {reviewing && (
        <div className="px-6 lg:px-10 pt-5">
          <div className="rounded-[12px] border border-anima-200 bg-anima-50 px-5 py-4 flex items-start gap-3">
            <Sparkles
              size={15}
              strokeWidth={1.75}
              className="text-anima-700 mt-0.5 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] text-anima-700 font-medium mb-1 break-keep">
                축하합니다! 우리 브랜드만의 독보적인 페르소나가 탄생했습니다.
                {filledCount > 0 && (
                  <span className="ml-1.5 text-[11.5px] tabular-nums text-anima-700/70 font-normal">
                    ({filledCount}개 칸)
                  </span>
                )}
              </p>
              <p className="text-[12.5px] text-anima-700/85 leading-[1.65] break-keep">
                Anima가 진단한 정체성, 가치관, 톤 가이드라인을 슥 훑어보세요.
                마음에 든다면 우상단{" "}
                <span className="font-medium">
                  이대로 페르소나 완성하기
                </span>{" "}
                버튼을 눌러주세요. 필요한 문장은 언제든 직접 수정할 수 있어요.
              </p>
            </div>
            <button
              onClick={dismissReviewBanner}
              className="p-1 -mr-1 -mt-1 text-anima-700/60 hover:text-anima-700 transition-colors shrink-0"
              aria-label="배너 닫기"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <main className="flex-1 px-6 lg:px-10 py-10">
        <PersonaBuilder
          worldBuilding={channel.worldBuilding}
          onChange={handleUpdate}
        />
      </main>
    </div>
  );
}
