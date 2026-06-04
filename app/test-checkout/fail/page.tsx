"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/app/components/brand/Logo";
import { Button } from "@/app/components/ui/Button";

export default function TestCheckoutFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="h-16 px-6 lg:px-10 flex items-center justify-center border-b border-ink-200/60">
        <Logo variant="lockup" size={20} />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[440px] text-center">
          <p className="text-eyebrow text-[#7c3a31] mb-3">Payment failed</p>
          <h1 className="font-display text-[26px] text-ink-800 tracking-[-0.025em] mb-3">
            결제가 취소되었습니다.
          </h1>
          <p className="text-[14px] text-ink-500 leading-[1.65] mb-2">
            {message
              ? decodeURIComponent(message)
              : "결제창에서 결제를 마치지 못했습니다."}
          </p>
          {code && (
            <p className="text-[11.5px] text-ink-400 font-mono mb-8">
              code · {code}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-8">
            <Link href="/#pricing">
              <Button variant="secondary">요금제 다시 보기</Button>
            </Link>
            <a href="mailto:support@wondercreative.kr">
              <Button variant="ghost">문의하기</Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
