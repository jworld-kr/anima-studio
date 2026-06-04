"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { Logo } from "@/app/components/brand/Logo";
import { Button } from "@/app/components/ui/Button";
import { getPlan, PlanId } from "@/app/lib/billing";

type State = "processing" | "success" | "error";

export default function CheckoutSuccessPage() {
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
  const [planId, setPlanId] = useState<PlanId | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);

  useEffect(() => {
    const finalize = async () => {
      const authKey = searchParams.get("authKey");
      const customerKey = searchParams.get("customerKey");
      const planParam = searchParams.get("planId") as PlanId | null;

      if (!authKey || !customerKey || !planParam) {
        setError("결제 정보를 찾을 수 없습니다.");
        setState("error");
        return;
      }

      const plan = getPlan(planParam);
      if (!plan) {
        setError("잘못된 플랜입니다.");
        setState("error");
        return;
      }
      setPlanId(planParam);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
        setState("error");
        return;
      }

      try {
        const res = await fetch("/api/billing/issue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            authKey,
            customerKey,
            planId: planParam,
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          setError(
            errBody.detail ||
              errBody.error ||
              "결제를 마치지 못했습니다. 잠시 후 다시 시도해주세요."
          );
          setState("error");
          return;
        }
        const data = await res.json();
        setNextBillingDate(data.nextBillingDate ?? null);
        setState("success");
      } catch (e) {
        console.error(e);
        setError(
          e instanceof Error
            ? e.message
            : "결제를 마치지 못했습니다. 잠시 후 다시 시도해주세요."
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
                결제를 처리 중입니다.
              </h1>
              <p className="text-[14px] text-ink-500 leading-[1.6]">
                잠시만 기다려주세요. 카드 정보를 확인하고 첫 결제를
                진행하고 있습니다.
              </p>
            </>
          )}

          {state === "success" && planId && (
            <>
              <div className="w-12 h-12 rounded-full bg-anima-100 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle2
                  size={22}
                  strokeWidth={1.75}
                  className="text-anima-600"
                />
              </div>
              <p className="text-eyebrow text-anima-600 mb-3">
                Welcome to {getPlan(planId)?.name}
              </p>
              <h1 className="font-display text-[28px] text-ink-800 tracking-[-0.025em] mb-3">
                결제가 완료되었습니다.
              </h1>
              <p className="text-[14px] text-ink-500 leading-[1.65] mb-2">
                {getPlan(planId)?.name} 플랜이 활성화되었습니다.
              </p>
              {nextBillingDate && (
                <p className="text-[12.5px] text-ink-400 mb-9">
                  다음 결제 예정일 ·{" "}
                  <span className="tabular-nums text-ink-600">
                    {new Date(nextBillingDate).toLocaleDateString("ko-KR")}
                  </span>
                </p>
              )}
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
              <p className="text-eyebrow text-[#7c3a31] mb-3">Payment failed</p>
              <h1 className="font-display text-[26px] text-ink-800 tracking-[-0.025em] mb-3">
                결제를 마치지 못했습니다.
              </h1>
              <p className="text-[13.5px] text-ink-500 leading-[1.65] mb-8">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/#pricing">
                  <Button variant="secondary">요금제로</Button>
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
