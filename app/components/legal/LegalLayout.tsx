import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { Logo } from "../brand/Logo";

interface LegalLayoutProps {
  eyebrow: string;
  title: string;
  effectiveDate: string;
  children: ReactNode;
}

export function LegalLayout({
  eyebrow,
  title,
  effectiveDate,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top bar */}
      <header className="h-16 px-6 lg:px-10 flex items-center justify-between border-b border-ink-200/60">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink-500 hover:text-ink-800 transition-colors text-[13px]"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span>홈으로</span>
        </Link>
        <div className="flex items-baseline gap-2">
          <Logo variant="lockup" size={20} />
          <span className="text-[10px] text-ink-300 italic tracking-[0.04em] hidden sm:inline">
            for Thread
          </span>
        </div>
        <div className="w-[60px]" />
      </header>

      {/* Page header */}
      <div className="px-6 lg:px-10 pt-14 lg:pt-20 pb-8 max-w-[860px] mx-auto w-full">
        <p className="text-eyebrow text-anima-600 mb-4">{eyebrow}</p>
        <h1
          className="font-display text-ink-800 mb-4"
          style={{
            fontSize: "clamp(32px, 4vw, 44px)",
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            fontWeight: 400,
          }}
        >
          {title}
        </h1>
        <p className="text-[13px] text-ink-400 tabular-nums">
          시행일 · {effectiveDate}
        </p>
      </div>

      {/* Body */}
      <main className="flex-1 px-6 lg:px-10 pb-20 max-w-[860px] mx-auto w-full">
        <div className="legal-body">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-200/60 bg-canvas/40">
        <div className="max-w-[860px] mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-[11.5px] text-ink-400 font-mono tracking-[0.02em]">
            © 2026 WONDERCREATIVE. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-[11.5px] text-ink-500">
            <Link href="/terms" className="hover:text-ink-800 transition-colors">
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="hover:text-ink-800 transition-colors"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/refund"
              className="hover:text-ink-800 transition-colors"
            >
              환불정책
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface SectionProps {
  number: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ number, title, children }: SectionProps) {
  return (
    <section className="mb-10">
      <h2
        className="font-display text-ink-800 mb-4 flex items-baseline gap-3"
        style={{
          fontSize: "clamp(20px, 2vw, 24px)",
          lineHeight: 1.35,
          letterSpacing: "-0.02em",
          fontWeight: 500,
        }}
      >
        <span className="font-mono text-[12px] tabular-nums text-ink-400 tracking-[0.06em]">
          {number}
        </span>
        <span>{title}</span>
      </h2>
      <div className="text-[14.5px] text-ink-700 leading-[1.85] space-y-3">
        {children}
      </div>
    </section>
  );
}

interface ListProps {
  items: ReactNode[];
}

export function LegalOl({ items }: ListProps) {
  return (
    <ol className="space-y-2 list-decimal pl-5 marker:text-ink-400 marker:font-mono marker:text-[12px]">
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          {item}
        </li>
      ))}
    </ol>
  );
}

export function LegalUl({ items }: ListProps) {
  return (
    <ul className="space-y-1.5 list-disc pl-5 marker:text-ink-400">
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function LegalTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="my-4 overflow-x-auto rounded-[10px] border border-ink-200">
      <table className="w-full text-[13.5px]">
        <thead>
          <tr className="bg-ink-50/60 border-b border-ink-200">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-4 py-3 font-medium text-ink-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={
                ri !== rows.length - 1 ? "border-b border-ink-200" : ""
              }
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-ink-600 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
