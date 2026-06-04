"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { Logo } from "@/app/components/brand/Logo";
import { Button } from "@/app/components/ui/Button";

/**
 * OAuth callback handler. Supabase exchanges the code for a session
 * (it stores the session in localStorage automatically when using the
 * default detectSessionInUrl). We just wait for the session and route
 * the user into the app.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errParam = searchParams.get("error_description");
    if (errParam) {
      setError(decodeURIComponent(errParam));
      return;
    }

    let cancelled = false;

    const finalize = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          // Supabase hasn't finalized the exchange yet — listen for the
          // next auth state change.
          const { data: sub } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
              if (cancelled) return;
              if (newSession) {
                sub.subscription.unsubscribe();
                router.replace("/channels");
              }
            }
          );
          return;
        }

        router.replace("/channels");
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError(
          e instanceof Error ? e.message : "로그인을 마칠 수 없습니다."
        );
      }
    };

    finalize();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <header className="h-16 px-6 lg:px-10 flex items-center justify-between border-b border-ink-200/60">
          <Link
            href="/login"
            className="flex items-center gap-2 text-ink-500 hover:text-ink-800 transition-colors text-[13px]"
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            <span>로그인으로</span>
          </Link>
          <Logo variant="lockup" size={20} />
          <div className="w-[80px]" />
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-[420px] text-center">
            <p className="text-eyebrow text-[#7c3a31] mb-3">Sign-in failed</p>
            <h1 className="font-display text-[28px] text-ink-800 tracking-[-0.025em] mb-3">
              로그인을 완료할 수 없습니다.
            </h1>
            <p className="text-[14px] text-ink-500 leading-[1.65] mb-8">
              {error}
            </p>
            <Link href="/login">
              <Button variant="primary">로그인 페이지로</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <Logo variant="lockup" size={22} className="mb-6" />
          <p className="text-[13.5px] text-ink-500 tracking-[-0.005em]">
            로그인을 마치는 중…
          </p>
        </div>
      </main>
    </div>
  );
}
