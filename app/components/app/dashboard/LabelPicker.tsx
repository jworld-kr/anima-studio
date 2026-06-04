"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";

interface LabelPickerProps {
  label: string;
  /** Labels the persona has previously used. Shown at the top of the menu. */
  existingLabels: string[];
  onChange: (next: string) => void;
}

/**
 * Compact inline label chip + dropdown.
 * Rendered next to each generated topic so the user can quickly retag
 * before saving. Shows the persona's previously-used labels first, then
 * a free-form input for new labels.
 */
export function LabelPicker({
  label,
  existingLabels,
  onChange,
}: LabelPickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setDraft("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Dedupe + put current label first in the suggestion list
  const suggestions = Array.from(
    new Set([
      label,
      ...existingLabels.filter((l) => l && l !== label),
    ])
  );

  const commitDraft = () => {
    const next = draft.trim();
    if (!next) return;
    onChange(next);
    setOpen(false);
    setDraft("");
  };

  return (
    <div ref={ref} className="relative inline-block mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-ink-200 bg-ink-50 text-[11px] text-ink-500 hover:border-ink-300 hover:text-ink-700 transition-colors"
        title="라벨 변경"
      >
        <span>⌐ {label}</span>
        <ChevronDown size={10} strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 w-[200px] rounded-[10px] border border-ink-200 bg-paper shadow-[0_8px_24px_rgba(11,10,7,0.08)] py-1.5">
          {suggestions.length > 0 && (
            <ul className="max-h-[180px] overflow-y-auto">
              {suggestions.map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(l);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left text-[12.5px] text-ink-700 hover:bg-ink-50 transition-colors"
                  >
                    {l === label && (
                      <Check
                        size={11}
                        strokeWidth={2}
                        className="text-anima-600 shrink-0"
                      />
                    )}
                    <span
                      className={`truncate ${
                        l === label ? "font-medium" : "ml-[16px]"
                      }`}
                    >
                      {l}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-ink-200 px-2 py-1.5">
            <div className="flex items-center gap-1.5">
              <Plus
                size={11}
                strokeWidth={1.75}
                className="text-ink-400 shrink-0"
              />
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitDraft();
                  } else if (e.key === "Escape") {
                    setOpen(false);
                    setDraft("");
                  }
                }}
                placeholder="새 라벨 만들기"
                className="flex-1 text-[12px] text-ink-700 placeholder:text-ink-400 bg-transparent focus:outline-none"
              />
              {draft.trim() && (
                <button
                  type="button"
                  onClick={commitDraft}
                  className="text-[11px] text-anima-700 hover:text-anima-800 transition-colors"
                >
                  추가
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
