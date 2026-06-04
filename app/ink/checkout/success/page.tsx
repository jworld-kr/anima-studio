"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { Logo } from "@/app/components/brand/Logo";
import { InkIcon } from "@/app/components/brand/InkIcon";
import { Button } from "@/app/components/ui/Button";
import { getInkPackage } from "@/app/lib/ink";

type State = "processing" | "success" | "error";

export default function InkCheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>("processing");
  const [error, setError] = useState<string | null>(null);
  const [inkCredited, setInkCredited] = useState<number | null>(null);
  const [packageName, setPackageName] = useState<string | null>(null);

  useEffect(() => {
    const finalize = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amountParam = searchParams.get("amount");
      const packageId = searchParams.get("packageId");

      if (!paymentKey || !orderId || !amountParam || !packageId) {
        setError("결제 정보를 찾을 수 없습니다.");
        setState("error");
        return;
      }
      const amount = Number(amountParam);
      const pkg = getInkPackage(packageId);
      if (!pkg) {
        setError("잘못된 충전 패키지입니다.");
        setState("error");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
        setState("error");
        return;
      }

      try {
        const res = await fetch("/api/ink/charge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
            packageId,
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          setError(
            errBody.detail ||
              errBody.error ||
              "충전을 마치지 못했습니다. 잠시 후 다시 시도해주세요."
          );
          setState("error");
          return;
        }
        const data = await res.json();
        setInkCredited(data.inkCredited ?? pkg.totalInk);
        setPackageName(data.packageName ?? pkg.name);
        setState("success");
      } catch (e) {
        console.error(e);
        setError(
          e instanceof Error
            ? e.message
            : "충전을 마치지 못했습니다. 잠시 후 다시 시도해주세요."
        );
        setState("error");
      }
    };
    finalize();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="h-16 px-6 lg:px-10 flex items-center justify-center border-b border-ink-200/60">
        <Logo variant="lockup" size={20} />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[440px] text-center">
          {state === "processing" && (
            <>
              <div className="w-12 h-12 rounded-full bg-ink-100 mx-auto mb-6 flex items-center justify-center animate-pulse">
                <span className="w-3 h-3 rounded-full bg-ink-400" />
              </div>
              <h1 className="font-display text-[26px] text-ink-800 tracking-[-0.025em] mb-2">
                잉크를 충전 중입니다.
              </h1>
              <p className="text-[14px] text-ink-500 leading-[1.6]">
                결제를 확정하고 잉크를 적립하고 있습니다.
              </p>
            </>
          )}

          {state === "success" && inkCredited !== null && (
            <>
              <div className="w-12 h-12 rounded-full bg-anima-100 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle2
                  size={22}
                  strokeWidth={1.75}
                  className="text-anima-600"
                />
              </div>
              <p className="text-eyebrow text-anima-600 mb-3">
                Ink charged
              </p>
              <h1 className="font-display text-[28px] text-ink-800 tracking-[-0.025em] mb-3">
                {packageName} 충전 완료
              </h1>
              <div className="flex items-center justify-center gap-2 text-ink-700 mb-9">
                <InkIcon size={16} className="text-anima-500" />
                <p
                  className="font-mono tabular-nums tracking-[-0.02em]"
                  style={{ fontSize: 22, fontWeight: 500 }}
                >
                  +{inkCredited.toLocaleString()}
                </p>
                <span className="text-[13px] text-ink-500">잉크 적립</span>
              </div>
              <Link href="/channels">
                <Button
                  variant="primary"
                  size="lg"
                  trailingIcon={<ArrowRight size={15} strokeWidth={1.75} />}
                >
                  대시보드로 가기
                </Button>
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <p className="text-eyebrow text-[#7c3a31] mb-3">Charge failed</p>
              <h1 className="font-display text-[26px] text-ink-800 tracking-[-0.025em] mb-3">
                충전을 마치지 못했습니다.
              </h1>
              <p className="text-[13.5px] text-ink-500 leading-[1.65] mb-8">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/settings/billing">
                  <Button variant="secondary">구독 관리로</Button>
                </Link>
                <a href="mailto:support@wondercreative.kr">
                  <Button variant="primary">문의하기</Button>
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
