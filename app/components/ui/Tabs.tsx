"use client";

import { ReactNode } from "react";

interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

/**
 * Underline tab. The selected tab gets an ink underline; others stay subtle.
 * Counts (if provided) sit in monospaced tabular numerals.
 */
export function Tabs<T extends string>({
  items,
  active,
  onChange,
  className = "",
}: TabsProps<T>) {
  return (
    <div
      className={`flex items-center gap-1 border-b border-ink-200 overflow-x-auto ${className}`}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={`relative flex items-center gap-2 px-3 h-10 text-[13.5px] font-medium tracking-[-0.005em] whitespace-nowrap transition-colors duration-150 ${
              isActive
                ? "text-ink-800"
                : "text-ink-500 hover:text-ink-700"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={`tabular-nums font-mono text-[11px] tracking-[0] px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-ink-800 text-ink-50"
                    : "bg-ink-100 text-ink-400"
                }`}
              >
                {item.count}
              </span>
            )}
            {isActive && (
              <span
                aria-hidden
                className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink-800 rounded-full"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
