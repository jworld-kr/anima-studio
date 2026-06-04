"use client";

import { Channel } from "@/app/types";
import { Menu } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { Logo } from "../brand/Logo";
import { Sidebar } from "./Sidebar";
import { ToastProvider, useToast } from "../ui/Toast";
import { InkProvider } from "./InkContext";
import { InkTopupModal } from "./InkTopupModal";

interface AppLayoutProps {
  channels: Channel[];
  currentChannelId?: string;
  userEmail?: string;
  children: ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <ToastProvider>
      <InkProvider>
        <AppLayoutInner {...props} />
        <InkTopupModal />
      </InkProvider>
    </ToastProvider>
  );
}

const PC_HINT_KEY = "anima.pcHint.shown";

function AppLayoutInner({
  channels,
  currentChannelId,
  userEmail,
  children,
}: AppLayoutProps) {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { toast } = useToast();

  // PC-recommended hint on first mobile entry per browser
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobile) return;
    try {
      if (localStorage.getItem(PC_HINT_KEY) === "1") return;
      const t = setTimeout(() => {
        toast({
          title: "데스크톱 사용을 권장합니다",
          description:
            "모바일에서도 작동하지만, 페르소나와 콘텐츠 작업은 PC에서 더 편안합니다.",
          persistent: true,
          action: {
            label: "이해했어요",
            onClick: () => localStorage.setItem(PC_HINT_KEY, "1"),
          },
        });
      }, 600);
      return () => clearTimeout(t);
    } catch {
      // localStorage unavailable — fail silently
    }
  }, [toast]);

  // Close mobile sidebar when channel changes
  useEffect(() => {
    setMobileSidebar(false);
  }, [currentChannelId]);

  return (
    <div className="min-h-screen bg-paper text-ink-700 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0 shrink-0">
        <Sidebar
          channels={channels}
          currentChannelId={currentChannelId}
          userEmail={userEmail}
        />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink-900/30 animate-fade-in"
            onClick={() => setMobileSidebar(false)}
            aria-hidden
          />
          <div className="relative h-full bg-paper animate-slide-up shadow-[0_24px_64px_rgba(11,10,7,0.10)]">
            <Sidebar
              channels={channels}
              currentChannelId={currentChannelId}
              userEmail={userEmail}
              onClose={() => setMobileSidebar(false)}
            />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden px-4 py-3 flex items-center gap-3 border-b border-ink-200 bg-paper sticky top-0 z-30">
          <button
            onClick={() => setMobileSidebar(true)}
            className="p-2 -ml-2 text-ink-700 hover:text-ink-900 transition-colors shrink-0"
            aria-label="메뉴 열기"
          >
            <Menu size={18} strokeWidth={1.75} />
          </button>
          <div className="flex-1 min-w-0 flex flex-col items-center text-center">
            <Logo variant="lockup" size={17} />
            <p className="mt-0.5 text-[10.5px] text-ink-500 leading-[1.35] truncate max-w-full">
              페르소나 기반 콘텐츠 스튜디오.
            </p>
          </div>
          <span
            className="shrink-0 text-[10px] text-ink-300 italic tracking-[0.04em]"
            aria-label="for Thread"
          >
            for Thread
          </span>
        </header>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
