"use client";

import { ThreadContent } from "@/app/types";
import { useEffect, useState } from "react";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { useToast } from "../../ui/Toast";

interface PublishPanelProps {
  content: ThreadContent;
  personaName: string;
  onClose: () => void;
  onMarkPublished: () => Promise<void> | void;
}

const INTENT_URL = "https://www.threads.com/intent/post";

export function PublishPanel({
  content,
  personaName,
  onClose,
  onMarkPublished,
}: PublishPanelProps) {
  const { toast } = useToast();
  const posts = content.output?.posts ?? [];
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [completedIdx, setCompletedIdx] = useState<Set<number>>(new Set());
  const [firstLaunched, setFirstLaunched] = useState(false);
  const [marking, setMarking] = useState(false);

  // Lock body scroll while open
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

  const buildIntentUrl = (text: string) => {
    const url = new URL(INTENT_URL);
    url.searchParams.set("text", text);
    return url.toString();
  };

  const writeClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback — execCommand for older mobile browsers
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch (e2) {
        console.error(e2);
        return false;
      }
    }
  };

  const launchFirstPost = async () => {
    if (posts.length === 0) return;
    const firstText = posts[0].content;
    // Also drop it on the clipboard, just in case the intent URL is blocked.
    await writeClipboard(firstText);
    const url = buildIntentUrl(firstText);

    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      // Top-level navigation lets iOS/Android Universal Links hand off to the
      // installed Threads app. window.open(_blank) just stays in the browser.
      // When the app is installed the OS opens it and this page stays put;
      // otherwise it falls back to the Threads web composer.
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    setFirstLaunched(true);
    setCompletedIdx((prev) => {
      const next = new Set(prev);
      next.add(0);
      return next;
    });
    toast({
      description: isMobile
        ? "Threads 작성창을 열었습니다."
        : "Threads 작성창을 새 탭에서 열었습니다.",
      variant: "success",
      duration: 2400,
    });
  };

  const copyPost = async (idx: number) => {
    const text = posts[idx].content;
    const ok = await writeClipboard(text);
    if (!ok) {
      toast({
        description: "복사에 실패했습니다. 직접 선택해 복사해주세요.",
        variant: "danger",
      });
      return;
    }
    setCopiedIdx(idx);
    setCompletedIdx((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    setTimeout(() => {
      setCopiedIdx((cur) => (cur === idx ? null : cur));
    }, 1600);
  };

  const handleMarkPublished = async () => {
    setMarking(true);
    try {
      await onMarkPublished();
    } finally {
      setMarking(false);
    }
  };

  const allComplete =
    completedIdx.size === posts.length && posts.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center sm:justify-center sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal
    >
      <div
        className="absolute inset-0 bg-ink-900/45"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-paper border border-ink-200 sm:rounded-[14px] shadow-[0_24px_64px_rgba(11,10,7,0.16)] w-full sm:max-w-[640px] sm:max-h-[88vh] flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <header className="px-5 sm:px-6 h-14 flex items-center justify-between border-b border-ink-200 shrink-0">
          <div className="min-w-0">
            <p className="text-eyebrow text-ink-400 mb-0.5">Publish</p>
            <p className="text-[14px] font-medium text-ink-800 truncate">
              {personaName} · {posts.length} posts
            </p>
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
        <div className="flex-1 overflow-y-auto">
          {/* Intro / first post launcher */}
          <section className="px-5 sm:px-6 pt-6 pb-5 border-b border-ink-200">
            <h2
              className="font-display text-ink-800 mb-2"
              style={{
                fontSize: "clamp(22px, 2.5vw, 28px)",
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
                fontWeight: 400,
              }}
            >
              Threads에 발행하기
            </h2>
            <p className="text-[13.5px] text-ink-500 leading-[1.65] mb-5">
              아래 버튼을 누르면 Threads 작성창이 열리고{" "}
              <span className="text-ink-800 font-medium">첫 포스트</span>가
              자동으로 채워집니다. 이후{" "}
              <span className="text-ink-800 font-medium">
                [+ 스레드에 추가]
              </span>{" "}
              버튼을 눌러 빈 칸을 만들고, 이 패널의 복사 버튼으로 다음
              포스트를 차례로 붙여넣으세요.
            </p>

            <Button
              variant="primary"
              size="lg"
              onClick={launchFirstPost}
              leadingIcon={<ExternalLink size={15} strokeWidth={1.75} />}
              className="w-full sm:w-auto"
              disabled={posts.length === 0}
            >
              {firstLaunched
                ? "다시 Threads 열기"
                : "Threads 열고 첫 포스트 입력"}
            </Button>

            {firstLaunched && (
              <p className="mt-3 text-[12px] text-anima-700 flex items-center gap-1.5">
                <Check size={12} strokeWidth={2} className="text-anima-500" />
                Threads 작성창이 열리고 첫 포스트가 채워졌어요.
              </p>
            )}
          </section>

          {/* Posts list */}
          <section className="px-5 sm:px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-eyebrow text-ink-400">포스트</p>
              <p className="text-[11.5px] text-ink-400 tabular-nums">
                {completedIdx.size} / {posts.length} 진행
              </p>
            </div>

            <ol className="space-y-2">
              {posts.map((post, idx) => {
                const isFirst = idx === 0;
                const isCopied = copiedIdx === idx;
                const isComplete = completedIdx.has(idx);
                return (
                  <li key={idx}>
                    <Card
                      variant={isComplete ? "muted" : "default"}
                      className="px-4 py-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`font-mono text-[10.5px] tabular-nums mt-0.5 shrink-0 ${
                            isComplete ? "text-anima-600" : "text-ink-400"
                          }`}
                        >
                          0{idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-[10.5px] text-ink-400 tracking-[0.08em] uppercase font-medium">
                              {isFirst
                                ? "첫 포스트 (위 버튼으로 자동 입력)"
                                : `포스트 ${idx + 1}`}
                            </p>
                            {isComplete && (
                              <CheckCircle2
                                size={13}
                                strokeWidth={1.75}
                                className="text-anima-500 shrink-0"
                                aria-label="진행됨"
                              />
                            )}
                          </div>
                          <p className="text-[13.5px] text-ink-700 leading-[1.65] whitespace-pre-wrap mb-3">
                            {post.content}
                          </p>
                          {!isFirst && (
                            <Button
                              size="sm"
                              variant={isCopied ? "anima" : "secondary"}
                              onClick={() => copyPost(idx)}
                              leadingIcon={
                                isCopied ? (
                                  <Check
                                    size={12}
                                    strokeWidth={2}
                                  />
                                ) : (
                                  <Copy size={12} strokeWidth={1.75} />
                                )
                              }
                            >
                              {isCopied ? "복사됨" : `복사하기 0${idx + 1}`}
                            </Button>
                          )}
                          {isFirst && firstLaunched && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyPost(idx)}
                              leadingIcon={
                                isCopied ? (
                                  <Check
                                    size={12}
                                    strokeWidth={2}
                                  />
                                ) : (
                                  <Copy size={12} strokeWidth={1.75} />
                                )
                              }
                            >
                              {isCopied
                                ? "복사됨"
                                : "다시 복사"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-ink-200 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0 bg-paper">
          <Button variant="ghost" size="md" onClick={onClose}>
            나중에 마저 발행
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleMarkPublished}
            disabled={marking}
            trailingIcon={<ArrowRight size={13} strokeWidth={1.75} />}
          >
            {marking
              ? "기록 중…"
              : allComplete
              ? "발행 완료로 표시"
              : "발행했어요"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
