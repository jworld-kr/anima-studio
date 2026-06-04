"use client";

import { Channel } from "@/app/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Settings,
  LogOut,
  Search,
  ChevronsLeft,
  CreditCard,
} from "lucide-react";
import { Logo } from "../brand/Logo";
import { personaColor, personaInitial } from "@/app/lib/personaColor";
import { supabase } from "@/app/lib/supabase";
import { InkPill } from "./InkPill";
import { PlanPickerModal } from "./PlanPickerModal";
import type { PlanId } from "@/app/lib/billing";
import { limitForPlan } from "@/app/lib/persona-limit";

interface SidebarProps {
  channels: Channel[];
  currentChannelId?: string;
  userEmail?: string;
  onClose?: () => void;
}

export function Sidebar({
  channels,
  currentChannelId,
  userEmail,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [plan, setPlan] = useState<PlanId>("free");
  const [planPickerOpen, setPlanPickerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data && data.status === "active") {
        setPlan((data.plan as PlanId) ?? "free");
      } else {
        setPlan("free");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const personaLimit = limitForPlan(plan);
  const atLimit = channels.length >= personaLimit;

  useEffect(() => {
    if (!menuOpenId) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpenId]);

  const filtered = channels.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-[260px] h-full flex flex-col bg-canvas/60 border-r border-ink-200">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-ink-200 relative">
        <Link
          href="/channels"
          className="block text-ink-800 hover:text-ink-700 transition-colors"
        >
          <Logo
            variant="block"
            size={22}
            tagline="페르소나 기반 콘텐츠 스튜디오."
            forLabel="for Thread"
          />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden absolute top-3 right-3 p-1.5 text-ink-400 hover:text-ink-700 transition-colors"
            aria-label="사이드바 닫기"
          >
            <ChevronsLeft size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search
            size={13}
            strokeWidth={1.75}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="페르소나 검색"
            className="w-full h-8 pl-7 pr-2 text-[12.5px] bg-ink-50 border border-transparent rounded-[6px] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:bg-paper focus:border-ink-200 transition-colors"
          />
        </div>
      </div>

      {/* Persona list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="flex items-center justify-between px-2 py-2">
          <p className="text-[10px] text-ink-400 tracking-[0.12em] uppercase font-medium">
            Personas
          </p>
          <span className="text-[10px] tabular-nums text-ink-400">
            {channels.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-[12px] text-ink-400 text-center py-6 px-2 leading-[1.5]">
            {query ? "검색 결과가 없습니다" : "아직 페르소나가 없습니다"}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((channel) => {
              const isActive = channel.id === currentChannelId;
              const color = personaColor(channel.id);
              const isMenuOpen = menuOpenId === channel.id;

              return (
                <li key={channel.id} className="relative group">
                  <Link
                    href={`/dashboard/${channel.id}`}
                    className={`flex items-center gap-2.5 pl-2.5 pr-1 py-1.5 rounded-[6px] transition-colors ${
                      isActive
                        ? "bg-ink-100 text-ink-800"
                        : "text-ink-600 hover:bg-ink-50 hover:text-ink-800"
                    }`}
                  >
                    {channel.thumbnail ? (
                      <img
                        src={channel.thumbnail}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-display text-ink-50 shrink-0"
                        style={{ background: color }}
                      >
                        {personaInitial(channel.name)}
                      </span>
                    )}
                    <span className="text-[13px] font-medium tracking-[-0.005em] truncate flex-1">
                      {channel.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : channel.id);
                      }}
                      className={`p-1 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-opacity ${
                        isActive || isMenuOpen
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      aria-label="페르소나 설정"
                    >
                      <Settings size={13} strokeWidth={1.75} />
                    </button>
                  </Link>

                  {isMenuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-1 top-full mt-1 z-20 w-48 bg-paper border border-ink-200 rounded-[8px] shadow-[0_8px_24px_rgba(11,10,7,0.08)] py-1 animate-fade-in"
                    >
                      <Link
                        href={`/channels/${channel.id}/worldbuilding`}
                        onClick={() => setMenuOpenId(null)}
                        className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-ink-50 transition-colors"
                      >
                        페르소나 편집
                      </Link>
                      <Link
                        href={`/dashboard/${channel.id}`}
                        onClick={() => setMenuOpenId(null)}
                        className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-ink-50 transition-colors"
                      >
                        대시보드 열기
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Ink balance */}
      <div className="px-3 pt-3">
        <InkPill />
      </div>

      {/* Bottom actions */}
      <div className="px-3 py-3 border-t border-ink-200 space-y-1 mt-3">
        {atLimit ? (
          <button
            onClick={() => setPlanPickerOpen(true)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-[6px] text-[13px] font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors text-left"
            title={`${plan} 플랜은 페르소나 ${personaLimit}개까지 만들 수 있어요. 업그레이드하면 더 만들 수 있습니다.`}
          >
            <span className="flex items-center gap-2">
              <Plus size={14} strokeWidth={1.75} />
              새 페르소나
            </span>
            <span className="text-[10px] tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-[4px] bg-anima-50 text-anima-700 border border-anima-200 font-medium">
              {channels.length}/{personaLimit}
            </span>
          </button>
        ) : (
          <Link
            href="/channels/new"
            className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-[6px] text-[13px] font-medium text-ink-700 hover:bg-ink-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Plus size={14} strokeWidth={1.75} />
              새 페르소나
            </span>
            <span className="text-[10px] tabular-nums text-ink-400">
              {channels.length}/{personaLimit}
            </span>
          </Link>
        )}
        <Link
          href="/settings/billing"
          className="flex items-center gap-2 px-2.5 py-2 rounded-[6px] text-[13px] font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-800 transition-colors"
        >
          <CreditCard size={14} strokeWidth={1.75} />
          구독 관리
        </Link>
        {userEmail && (
          <div className="flex items-center justify-between gap-2 px-2.5 py-2 group">
            <p className="text-[11.5px] text-ink-400 truncate">{userEmail}</p>
            <button
              onClick={handleLogout}
              className="p-1 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="로그아웃"
              title="로그아웃"
            >
              <LogOut size={13} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      <PlanPickerModal
        open={planPickerOpen}
        onClose={() => setPlanPickerOpen(false)}
        currentPlan={plan}
      />
    </aside>
  );
}
