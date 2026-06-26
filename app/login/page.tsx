"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { Logo } from "@/app/components/brand/Logo";
import { Button } from "@/app/components/ui/Button";
import { Input, Label } from "@/app/components/ui/Input";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setInfo("");
    setIsGoogleLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
      // Supabase will redirect the page; nothing more to do here.
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google 로그인을 시작할 수 없습니다.";
      setError(message);
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setInfo("회원가입이 완료되었습니다. 로그인해주세요.");
        setMode("signin");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/channels");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "오류가 발생했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen flex flex-col bg-paper">
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left: form */}
        <main className="flex items-center justify-center px-6 py-16 lg:px-12">
          <div className="w-full max-w-[400px]">
            <p className="text-eyebrow text-anima-600 mb-3">
              {isSignup ? "Create account" : "Welcome back"}
            </p>
            <h1
              className="font-display text-ink-800 mb-3"
              style={{
                fontSize: "clamp(32px, 4vw, 40px)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                fontWeight: 400,
              }}
            >
              {isSignup ? (
                <>
                  당신의 페르소나를
                  <br />
                  시작하세요.
                </>
              ) : (
                <>
                  다시 오신 것을
                  <br />
                  환영합니다.
                </>
              )}
            </h1>
            <p className="text-[14px] text-ink-500 mb-9 leading-[1.6]">
              {isSignup
                ? "Google 계정으로 빠르게 시작하거나, 이메일로 가입하세요."
                : "Google 계정으로 빠르게 로그인하거나, 이메일을 사용하세요."}
            </p>

            {/* Google sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full h-11 px-4 rounded-[10px] border border-ink-200 bg-paper hover:bg-ink-50 hover:border-ink-300 disabled:opacity-50 disabled:cursor-not-allowed text-[14px] font-medium text-ink-700 transition-colors flex items-center justify-center gap-2.5 mb-5"
            >
              <GoogleIcon />
              {isGoogleLoading
                ? "Google로 이동 중…"
                : isSignup
                ? "Google로 시작하기"
                : "Google로 로그인"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <span className="flex-1 h-px bg-ink-200" />
              <span className="text-[11px] text-ink-400 tracking-[0.06em] uppercase">
                또는
              </span>
              <span className="flex-1 h-px bg-ink-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.kr"
                  autoComplete="email"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={
                    isSignup ? "new-password" : "current-password"
                  }
                  className="mt-2"
                />
              </div>

              {error && (
                <div className="px-3.5 py-2.5 rounded-[8px] bg-[rgba(181,86,74,0.08)] border border-[rgba(181,86,74,0.20)]">
                  <p className="text-[12.5px] text-[#7c3a31] leading-[1.5]">
                    {error}
                  </p>
                </div>
              )}

              {info && (
                <div className="px-3.5 py-2.5 rounded-[8px] bg-anima-50 border border-anima-200">
                  <p className="text-[12.5px] text-anima-700 leading-[1.5]">
                    {info}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                trailingIcon={
                  !isLoading ? (
                    <ArrowRight size={15} strokeWidth={1.75} />
                  ) : undefined
                }
                className="w-full"
              >
                {isLoading
                  ? "처리중…"
                  : isSignup
                  ? "계정 만들기"
                  : "로그인"}
              </Button>
            </form>

            <div className="mt-7 pt-7 border-t border-ink-200">
              <p className="text-[13px] text-ink-500 text-center">
                {isSignup ? "이미 계정이 있으신가요?" : "처음이신가요?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(isSignup ? "signin" : "signup");
                    setError("");
                    setInfo("");
                  }}
                  className="text-ink-800 font-medium hover:text-anima-600 transition-colors"
                >
                  {isSignup ? "로그인" : "무료로 시작하기"}
                </button>
              </p>
            </div>
          </div>
        </main>

        {/* Right: brand quote (desktop only) */}
        <aside className="hidden lg:flex relative items-center justify-center bg-canvas/60 border-l border-ink-200/60 px-12 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 -z-0"
            style={{
              background:
                "radial-gradient(50% 60% at 50% 40%, rgba(196, 211, 184, 0.30) 0%, rgba(247, 246, 242, 0) 70%)",
            }}
          />
          <div className="relative max-w-[420px]">
            <span className="text-eyebrow text-anima-600 mb-6 inline-flex items-center gap-2">
              Persona Content Studio
              <span className="w-1 h-1 rounded-full bg-anima-400/60" aria-hidden />
              <span className="text-ink-400 italic normal-case tracking-[0.04em]">
                for Thread
              </span>
            </span>
            <p
              className="font-display text-ink-700 mt-6 mb-4"
              style={{
                fontSize: "clamp(16px, 1.6vw, 20px)",
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              페르소나 설계부터 기획까지,
            </p>
            <p
              className="font-display text-ink-900 mb-8"
              style={{
                fontSize: "clamp(26px, 2.8vw, 36px)",
                lineHeight: 1.16,
                letterSpacing: "-0.038em",
                fontWeight: 600,
              }}
            >
              가장 완벽한
              <br />
              브랜드 콘텐츠 스튜디오
            </p>
            <div className="h-px bg-ink-200 mb-6 w-12" />
            <p className="text-[13.5px] text-ink-500 leading-[1.75]">
              비싼 브랜딩 컨설팅 없이도{" "}
              <span className="text-ink-700 font-medium">
                우리 브랜드만의 고유한 색
              </span>
              을 만들고,
              <br />
              톤앤매너가 살아있는{" "}
              <span className="text-ink-700 font-medium">
                콘텐츠를 빠르게 완성하세요.
              </span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.806.54-1.8368.8595-3.0477.8595-2.344 0-4.3282-1.5832-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
        fill="#EA4335"
      />
    </svg>
  );
}
