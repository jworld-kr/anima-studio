"use client";

import { Channel } from "@/app/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, ArrowRight } from "lucide-react";
import { personaColor, personaInitial } from "@/app/lib/personaColor";

interface PersonaCardProps {
  channel: Channel;
  onEdit: (channel: Channel) => void;
  onDelete: (id: string) => void;
}

export function PersonaCard({ channel, onEdit, onDelete }: PersonaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const accent = personaColor(channel.id);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const createdDate = new Date(channel.createdAt);
  const daysAgo = Math.floor(
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dateLabel =
    daysAgo === 0
      ? "오늘"
      : daysAgo === 1
      ? "어제"
      : daysAgo < 30
      ? `${daysAgo}일 전`
      : createdDate.toLocaleDateString("ko-KR");

  const oneline = channel.worldBuilding?.basic?.oneline?.trim();
  const job = channel.worldBuilding?.basic?.job?.trim();

  const handleDelete = () => {
    if (confirm(`"${channel.name}" 페르소나를 삭제하시겠습니까?`)) {
      onDelete(channel.id);
      setMenuOpen(false);
    }
  };

  return (
    <article className="group relative bg-paper border border-ink-200 rounded-[14px] hover:border-ink-300 transition-colors overflow-hidden">
      {/* Top accent strip — the only place persona color touches the UI */}
      <div className="h-1.5" style={{ background: accent }} />

      <Link href={`/dashboard/${channel.id}`} className="block px-6 pt-6 pb-5">
        <div className="flex items-start gap-3 mb-5">
          {channel.thumbnail ? (
            <img
              src={channel.thumbnail}
              alt=""
              className="w-11 h-11 rounded-full object-cover shrink-0"
            />
          ) : (
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-display text-ink-50 shrink-0"
              style={{ background: accent }}
            >
              {personaInitial(channel.name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[20px] text-ink-800 tracking-[-0.02em] leading-tight truncate">
              {channel.name}
            </h3>
            {job && (
              <p className="text-[12px] text-ink-400 mt-1 truncate">{job}</p>
            )}
          </div>
        </div>

        <p className="text-[13.5px] text-ink-500 leading-[1.6] line-clamp-2 min-h-[44px]">
          {oneline || (
            <span className="text-ink-400 italic">
              아직 한 줄 소개가 없습니다.
            </span>
          )}
        </p>

        <div className="mt-5 pt-4 border-t border-ink-200 flex items-center justify-between">
          <p className="text-[11px] text-ink-400 tracking-[0.02em]">
            {dateLabel} 생성
          </p>
          <span className="text-[12px] text-ink-500 group-hover:text-ink-800 transition-colors flex items-center gap-1">
            대시보드 열기
            <ArrowRight size={12} strokeWidth={1.75} />
          </span>
        </div>
      </Link>

      {/* Menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1.5 rounded-md text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="더보기"
        >
          <MoreHorizontal size={14} strokeWidth={1.75} />
        </button>
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full mt-1 z-20 w-44 bg-paper border border-ink-200 rounded-[8px] shadow-[0_8px_24px_rgba(11,10,7,0.10)] py-1 animate-fade-in"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(channel);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12.5px] text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <Pencil size={12} strokeWidth={1.75} />
              이름·이미지 편집
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12.5px] text-[#7c3a31] hover:bg-[rgba(181,86,74,0.08)] transition-colors"
            >
              <Trash2 size={12} strokeWidth={1.75} />
              페르소나 삭제
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
