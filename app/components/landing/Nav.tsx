"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../brand/Logo";
import { Button } from "../ui/Button";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? "bg-[rgba(251,250,247,0.78)] backdrop-blur-md border-b border-ink-200/60"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-baseline gap-2 text-ink-800 hover:text-ink-700 transition-colors"
        >
          <Logo variant="lockup" size={22} />
          <span className="text-[11px] text-ink-300 italic tracking-[0.04em] hidden sm:inline">
            for Thread
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[14px] text-ink-600">
          <a
            href="#why-thread"
            className="hover:text-ink-800 transition-colors"
          >
            왜 Thread
          </a>
          <a href="#how" className="hover:text-ink-800 transition-colors">
            작동 방식
          </a>
          <a href="#roi" className="hover:text-ink-800 transition-colors">
            비용 비교
          </a>
          <a href="#pricing" className="hover:text-ink-800 transition-colors">
            요금제
          </a>
          <a href="#faq" className="hover:text-ink-800 transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              로그인
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm">
              시작하기
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
