"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CreditCard, AlertCircle } from "lucide-react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { supabase } from "@/app/lib/supabase";
import { Logo } from "@/app/components/brand/Logo";
import { Button } from "@/app/components/ui/Button";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { generateOrderId, getPlan, PlanId } from "@/app/lib/billing";

/**
 * TEST-ONLY one-shot checkout page.
 * Use this until the Toss billing(자동결제) contract is approved.
 * Same UI as /checkout/[plan] but routes through `requestPayment`
 * (single charge) instead of `requestBillingAuth` (recurring).
 */

export default function TestCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.plan as PlanId;
  const plan = getPlan(planId);

  const [user, setUser] = useState<{ id: string; email?: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push(`/login?next=/test-checkout/${planId}`);
        return;
      }
      setUser({ id: session.user.id, email: session.user.email });
      setLoading(false);
    };
    init();
  }, [planId, router]);

  if (!plan || plan.id === "free") {
    return (
      <ErrorScreen
        title="잘못된 플랜입니다."
        description="요금제 페이지에서 다시 선택해주세요."
      />
    );
  }

  const handleCheckout = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      setError("결제 시스템 설정 오류 (NEXT_PUBLIC_TOSS_CLIENT_KEY).");
      setSubmitting(false);
      return;
    }

    try {
      const tossPayments = await loadTossPayments(clientKey);
      const orderId = generateOrderId(user.id, plan.id);
      const orderName = `Anima ${plan.name} 1개월 (테스트)`;
      const origin = window.location.origin;

      await tossPayments.requestPayment("카드", {
        amount: plan.price,
        orderId,
        orderName,
        customerEmail: user.email,
        successUrl: `${origin}/test-checkout/success?planId=${plan.id}`,
        failUrl: `${origin}/test-checkout/fail`,
      });
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "결제창을 열 수 없습니다.";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="h-16 px-6 lg:px-10 flex items-center justify-between border-b border-ink-200/60">
        <Link
          href="/#pricing"
          className="flex items-center gap-2 text-ink-500 hover:text-ink-800 transition-colors text-[13px]"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span>요금제로</span>
        </Link>
        <Logo variant="lockup" size={20} />
        <div className="w-[80px]" />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <p className="text-eyebrow text-anima-600 mb-3">Test Checkout</p>
          <h1
            className="font-display text-ink-800 mb-2"
            style={{
              fontSize: "clamp(28px, 3.5vw, 36px)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            {plan.name} 플랜으로
            <br />
            업그레이드합니다.
          </h1>
          <p className="text-[14px] text-ink-500 leading-[1.65] mb-5">
            결제가 완료되면 1개월간 {plan.name} 플랜이 활성화됩니다.
          </p>

          {/* Test mode notice */}
          <div className="mb-9 px-4 py-3 rounded-[10px] bg-[rgba(201,169,97,0.08)] border border-[rgba(201,169,97,0.25)] flex items-start gap-2.5">
            <AlertCircle
              size={14}
              strokeWidth={1.75}
              className="text-[#7a6428] mt-0.5 shrink-0"
            />
            <div>
              <p className="text-[12.5px] font-medium text-[#7a6428] leading-[1.5] mb-0.5">
                1개월 이용권 · 단건 결제
              </p>
              <p className="text-[11.5px] text-[#7a6428]/80 leading-[1.6]">
                현재는 1개월 단위 결제로 운영됩니다. 매월 자동 결제 기능은
                추후 업데이트될 예정입니다.
              </p>
            </div>
          </div>

          {loading ? (
            <Skeleton className="h-[200px]" />
          ) : (
            <div className="rounded-[14px] border border-ink-200 bg-paper overflow-hidden">
              <div className="p-6 border-b border-ink-200">
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-display text-[22px] text-ink-800 tracking-[-0.02em]">
                    {plan.name}
                  </h2>
                  <p
                    className="font-display text-ink-800 tabular-nums"
                    style={{ fontSize: 28, letterSpacing: "-0.025em" }}
                  >
                    {plan.priceLabel}
                    <span className="text-[12px] text-ink-400 ml-1">
                      / 1개월
                    </span>
                  </p>
                </div>
                <p className="text-[13px] text-ink-500 leading-[1.6]">
                  {plan.description}
                </p>
                <ul className="mt-4 space-y-1.5 text-[12.5px] text-ink-600">
                  <li>· 페르소나 {plan.personas}개</li>
                  <li>
                    · 월 콘텐츠 {plan.monthlyContent}개
                    {plan.bonusContent > 0 && (
                      <span className="ml-1 text-anima-700">
                        +{plan.bonusContent} (얼리 액세스)
                      </span>
                    )}
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-ink-50/40">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-[13px] text-ink-600">결제 금액</p>
                  <p className="font-display text-[20px] text-ink-800 tabular-nums tracking-[-0.02em]">
                    {plan.priceLabel}
                  </p>
                </div>
                <p className="text-[11.5px] text-ink-400">
                  부가세(VAT) 포함 · 1회 결제
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 px-3.5 py-2.5 rounded-[8px] bg-[rgba(181,86,74,0.08)] border border-[rgba(181,86,74,0.20)]">
              <p className="text-[12.5px] text-[#7c3a31] leading-[1.5]">
                {error}
              </p>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleCheckout}
            disabled={loading || submitting || !user}
            leadingIcon={<CreditCard size={15} strokeWidth={1.75} />}
            className="w-full mt-6"
          >
            {submitting ? "결제창을 여는 중…" : "결제하기"}
          </Button>

          <div className="mt-5 flex items-start gap-2 text-[11.5px] text-ink-400 leading-[1.55]">
            <ShieldCheck
              size={13}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0"
            />
            <p>
              결제는 토스페이먼츠를 통해 처리됩니다. 환불은{" "}
              <a
                href="/refund"
                className="underline underline-offset-2 hover:text-ink-700"
              >
                환불정책
              </a>
              에 따릅니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function ErrorScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="h-16 px-6 lg:px-10 flex items-center justify-between border-b border-ink-200/60">
        <Link
          href="/#pricing"
          className="flex items-center gap-2 text-ink-500 hover:text-ink-800 transition-colors text-[13px]"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span>요금제로</span>
        </Link>
        <Logo variant="lockup" size={20} />
        <div className="w-[80px]" />
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-[400px]">
          <h1 className="font-display text-[26px] text-ink-800 tracking-[-0.025em] mb-3">
            {title}
          </h1>
          <p className="text-[14px] text-ink-500 mb-8">{description}</p>
          <Link href="/#pricing">
            <Button variant="primary">요금제 보기</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
