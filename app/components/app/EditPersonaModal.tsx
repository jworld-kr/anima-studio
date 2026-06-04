"use client";

import { Channel } from "@/app/types";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input, Label } from "../ui/Input";

interface EditPersonaModalProps {
  channel: Channel;
  onClose: () => void;
  onSave: (name: string, thumbnail?: string) => void;
}

export function EditPersonaModal({
  channel,
  onClose,
  onSave,
}: EditPersonaModalProps) {
  const [name, setName] = useState(channel.name);
  const [thumbnail, setThumbnail] = useState<string | undefined>(
    channel.thumbnail
  );

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setThumbnail(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), thumbnail);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal
    >
      <div
        className="absolute inset-0 bg-ink-900/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-paper border border-ink-200 rounded-[14px] shadow-[0_24px_64px_rgba(11,10,7,0.16)] w-full max-w-[480px] animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200">
          <h2 className="font-display text-[20px] text-ink-800 tracking-[-0.02em]">
            페르소나 편집
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 text-ink-400 hover:text-ink-800 transition-colors"
            aria-label="닫기"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <Label htmlFor="persona-name" required>
              이름
            </Label>
            <Input
              id="persona-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="mt-2"
            />
          </div>

          <div>
            <Label hint="비워두면 이름의 첫 글자가 표시됩니다.">
              썸네일 이미지
            </Label>
            <div className="flex items-center gap-4 mt-2">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-ink-100 border border-dashed border-ink-300" />
              )}
              <div className="flex-1">
                <input
                  id="persona-thumb"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="persona-thumb">
                  <span className="cursor-pointer inline-flex items-center justify-center h-9 px-3 rounded-[8px] border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50 transition-colors">
                    이미지 선택
                  </span>
                </label>
                {thumbnail && (
                  <button
                    type="button"
                    onClick={() => setThumbnail(undefined)}
                    className="ml-2 text-[12px] text-ink-400 hover:text-ink-700 transition-colors"
                  >
                    제거
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-ink-200 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!name.trim()}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
