"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { supabase } from "@/app/lib/supabase";
import { Logo } from "@/app/components/brand/Logo";
import { InkBottle, InkIcon } from "@/app/components/brand/InkIcon";
import { Button } from "@/app/components/ui/Button";
import { Skeleton } from "@/app/components/ui/Skeleton";
import {
  generateInkOrderId,
  getInkPackage,
  inkPriceForPlan,
  INK_TOPUP_DISCOUNT,
  formatKRW,
} from "@/app/lib/ink";
import { getCurrentPlan } from "@/app/lib/plan-client";
import type { PlanId } from "@/app/lib/billing";

export default function InkCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const pkgId = params.pkg as string;
  const pkg = getInkPackage(pkgId);

  const [user, setUser] = useState<{ id: string; email?: string } | null>(
    null
  );
  const [plan, setPlan] = useState<PlanId>("free");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push(`/login?next=/ink/checkout/${pkgId}`);
        return;
      }
      setUser({ id: session.user.id, email: session.user.email });
      const p = await getCurrentPlan();
      setPlan(p);
      setLoading(false);
    };
    init();
  }, [pkgId, router]);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-[26px] text-ink-800 tracking-[-0.025em] mb-3">
            잘못된 충전 패키지입니다.
          </h1>
          <Link href="/settings/billing">
            <Button variant="primary">구독 관리로</Button>
          </Link>
        </div>
      </div>
    );
  }

  const bottleSize =
    pkg.id === "ink_small"
      ? "small"
      : pkg.id === "ink_regular"
      ? "regular"
      : "large";

  const finalPrice = inkPriceForPlan(pkg.price, plan);
  const discountRate = INK_TOPUP_DISCOUNT[plan] ?? 0;
  const hasDiscount = finalPrice < pkg.price;

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
      const orderId = generateInkOrderId(user.id, pkg.id);
      const orderName = `Anima · ${pkg.name} (${pkg.totalInk.toLocaleString()} 잉크)`;
      const origin = window.location.origin;

      await tossPayments.requestPayment("카드", {
        amount: finalPrice,
        orderId,
        orderName,
        customerEmail: user.email,
        successUrl: `${origin}/ink/checkout/success?packageId=${pkg.id}`,
        failUrl: `${origin}/ink/checkout/fail`,
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
          href="/settings/billing"
          className="flex items-center gap-2 text-ink-500 hover:text-ink-800 transition-colors text-[13px]"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span>구독 관리로</span>
        </Link>
        <Logo variant="lockup" size={20} />
        <div className="w-[80px]" />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <p className="text-eyebrow text-anima-600 mb-3">Ink Checkout</p>
          <h1
            className="font-display text-ink-800 mb-2"
            style={{
              fontSize: "clamp(28px, 3.5vw, 36px)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            {pkg.name}을(를)
            <br />
            구매합니다.
          </h1>
          <p className="text-[14px] text-ink-500 leading-[1.65] mb-9">
            필요한 양만큼, 추가로 충전 후 사용할 수 있습니다.
          </p>

          {loading ? (
            <Skeleton className="h-[260px]" />
          ) : (
            <div className="rounded-[14px] border border-ink-200 bg-paper overflow-hidden">
              {/* Top: bottle + ink amount */}
              <div className="p-7 border-b border-ink-200 flex items-center gap-5">
                <div className="text-anima-500 shrink-0 w-[44px] h-[60px] flex items-end justify-center">
                  <InkBottle size={bottleSize} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-[22px] text-ink-800 tracking-[-0.02em] mb-1">
                    {pkg.name}
                  </h2>
                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <p className="font-mono text-[24px] text-ink-800 tabular-nums tracking-[-0.025em] font-medium">
                      {pkg.totalInk.toLocaleString()}
                    </p>
                    <span className="text-[12px] text-ink-500">잉크</span>
                  </div>
                  {pkg.bonusInk > 0 && (
                    <p className="text-[12px] text-anima-700">
                      기본 {pkg.baseInk.toLocaleString()} +{" "}
                      <span className="font-medium">
                        보너스 {pkg.bonusInk.toLocaleString()}
                      </span>{" "}
                      ({pkg.bonusPercent}%)
                    </p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="p-6 bg-ink-50/40">
                {hasDiscount && (
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-[5px] bg-anima-50 border border-anima-200 text-[10.5px] font-medium text-anima-700">
                      {plan.toUpperCase()} 할인 {Math.round(discountRate * 100)}%
                    </span>
                    <p className="font-mono text-[13px] text-ink-400 line-through tabular-nums">
                      {pkg.priceLabel}
                    </p>
                  </div>
                )}
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-[13px] text-ink-600">결제 금액</p>
                  <p className="font-display text-[20px] text-ink-800 tabular-nums tracking-[-0.02em]">
                    {formatKRW(finalPrice)}
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
            {submitting ? "결제창을 여는 중…" : `${formatKRW(finalPrice)} 결제하기`}
          </Button>

          <div className="mt-5 flex items-start gap-2 text-[11.5px] text-ink-400 leading-[1.55]">
            <ShieldCheck
              size={13}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0"
            />
            <p>
              결제는 토스페이먼츠를 통해 처리되며, 충전한 잉크는 즉시
              계정에 적립됩니다.{" "}
              <a
                href="/refund"
                className="underline underline-offset-2 hover:text-ink-700"
              >
                환불정책
              </a>
              에 따라 미사용 잉크에 한해 환불 가능합니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
