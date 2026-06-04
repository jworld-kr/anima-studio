"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { Logo } from "@/app/components/brand/Logo";
import { Button } from "@/app/components/ui/Button";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { ToastProvider, useToast } from "@/app/components/ui/Toast";
import { getPlan, PlanId, PLANS } from "@/app/lib/billing";
import {
  INK_PACKAGES,
  inkPriceForPlan,
  INK_TOPUP_DISCOUNT,
  formatKRW,
} from "@/app/lib/ink";
import { InkBottle, InkIcon } from "@/app/components/brand/InkIcon";
import { PlanPickerModal } from "@/app/components/app/PlanPickerModal";

interface Subscription {
  id: string;
  plan: PlanId;
  status: "active" | "cancelled" | "past_due" | "expired";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface BillingKey {
  card_company: string | null;
  card_number: string | null;
}

interface Payment {
  id: string;
  toss_order_id: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

interface InkBalance {
  subscription: number;
  topup: number;
  total: number;
}

export default function BillingSettingsPage() {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
}

function Inner() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(
    null
  );
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingKey, setBillingKey] = useState<BillingKey | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ink, setInk] = useState<InkBalance | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [planPickerOpen, setPlanPickerOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUser({ id: session.user.id, email: session.user.email });

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setSubscription(sub as Subscription | null);

      const { data: bk } = await supabase
        .from("billing_keys")
        .select("card_company, card_number")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setBillingKey(bk as BillingKey | null);

      const { data: pays } = await supabase
        .from("payments")
        .select("id, toss_order_id, amount, status, paid_at, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(12);
      setPayments((pays as Payment[]) ?? []);

      try {
        const inkRes = await fetch("/api/ink/balance", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (inkRes.ok) {
          const inkData = await inkRes.json();
          setInk(inkData.balance);
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    };
    load();
  }, [router]);

  const handleCancel = async () => {
    if (!subscription) return;
    if (
      !window.confirm(
        "정말 구독을 해지하시겠습니까? 현재 결제 기간 만료까지 서비스를 계속 이용할 수 있습니다."
      )
    )
      return;

    setCancelling(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (!res.ok) throw new Error("CANCEL_FAILED");
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      setSubscription(sub as Subscription | null);
      toast({
        title: "구독이 해지되었습니다",
        description:
          "현재 결제 기간 만료일까지 서비스를 계속 이용하실 수 있습니다.",
        variant: "success",
      });
    } catch (e) {
      console.error(e);
      toast({
        description: "해지 처리 중 오류가 발생했습니다.",
        variant: "danger",
      });
    } finally {
      setCancelling(false);
    }
  };

  const currentPlan = subscription ? getPlan(subscription.plan) : PLANS.free;
  const isOnPaidPlan =
    subscription?.status === "active" && subscription.plan !== "free";
  // Active plan id for ink-discount pricing on the top-up cards.
  const activePlanId: PlanId =
    subscription?.status === "active" ? subscription.plan : "free";
  const inkDiscountRate = INK_TOPUP_DISCOUNT[activePlanId] ?? 0;

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="h-16 px-6 lg:px-10 flex items-center justify-between border-b border-ink-200/60 bg-paper sticky top-0 z-30">
        <Link
          href="/channels"
          className="flex items-center gap-2 text-ink-500 hover:text-ink-800 transition-colors text-[13px]"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span>대시보드로</span>
        </Link>
        <Logo variant="lockup" size={20} />
        <div className="w-[80px]" />
      </header>

      <main className="flex-1 px-6 lg:px-10 py-12 lg:py-16">
        <div className="max-w-[820px] mx-auto">
          <p className="text-eyebrow text-anima-600 mb-3">Billing</p>
          <h1
            className="font-display text-ink-800 mb-3"
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            구독과 잉크
          </h1>
          <div className="text-[13.5px] sm:text-[14px] text-ink-500 leading-[1.75] mb-10 max-w-[640px] space-y-2">
            <p>
              <span className="text-ink-700 font-medium">구독을 시작하면</span>{" "}
              매월 잉크가 자동으로 적립되고 페르소나 한도가 늘어납니다.
              번거로운 충전 없이 더 저렴하게 사용하실 수 있어요.
            </p>
            <p>
              <span className="text-ink-700 font-medium">아직 망설여진다면</span>{" "}
              잉크만 충전해서 가볍게 써보셔도 좋습니다.
            </p>
          </div>

          {loading ? (
            <Skeleton className="h-[400px]" />
          ) : (
            <div className="space-y-8">
              {/* ========== SUBSCRIPTION SECTION ========== */}
              <section>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-eyebrow text-ink-400 mb-1">
                      Subscription
                    </p>
                    <h2 className="font-display text-[20px] text-ink-800 tracking-[-0.02em]">
                      구독
                    </h2>
                  </div>
                </div>

                <div className="rounded-[14px] border border-ink-200 bg-paper overflow-hidden">
                  <div className="px-6 py-5 border-b border-ink-200 bg-ink-50/40">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-[24px] text-ink-800 tracking-[-0.02em]">
                        {currentPlan?.name ?? "Free"}
                      </h3>
                      <p className="font-display text-[20px] text-ink-700 tabular-nums tracking-[-0.02em]">
                        {currentPlan?.priceLabel ?? "₩0"}
                        {currentPlan && currentPlan.id !== "free" && (
                          <span className="text-[12px] text-ink-400 ml-1">
                            / 월
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-[12.5px] text-ink-500 mt-1.5 leading-[1.6]">
                      {currentPlan?.id === "free"
                        ? "무료 플랜으로 사용 중입니다. 페르소나 1개 · 매월 700 잉크."
                        : `매월 ${currentPlan?.monthlyContent.toLocaleString()} + ${currentPlan?.bonusContent.toLocaleString()} 잉크가 자동 적립됩니다.`}
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    <Row
                      label="상태"
                      value={
                        subscription ? (
                          <StatusBadge
                            status={subscription.status}
                            cancelAtEnd={subscription.cancel_at_period_end}
                          />
                        ) : (
                          <span className="text-ink-500 text-[13px]">
                            무료 플랜
                          </span>
                        )
                      }
                    />
                    {subscription?.current_period_end && (
                      <Row
                        label={
                          subscription.cancel_at_period_end
                            ? "서비스 종료 예정일"
                            : "다음 결제 예정일"
                        }
                        value={
                          <span className="text-[13.5px] text-ink-700 tabular-nums">
                            {new Date(
                              subscription.current_period_end
                            ).toLocaleDateString("ko-KR")}
                          </span>
                        }
                      />
                    )}
                    {billingKey && (
                      <Row
                        label="결제 수단"
                        value={
                          <span className="text-[13.5px] text-ink-700">
                            {billingKey.card_company || "카드"}{" "}
                            <span className="font-mono text-ink-500">
                              {billingKey.card_number}
                            </span>
                          </span>
                        }
                      />
                    )}
                  </div>

                  {subscription?.cancel_at_period_end && (
                    <div className="px-6 py-4 border-t border-ink-200 bg-[rgba(201,169,97,0.08)] flex items-start gap-2.5">
                      <AlertCircle
                        size={14}
                        strokeWidth={1.75}
                        className="text-[#7a6428] mt-0.5 shrink-0"
                      />
                      <p className="text-[12.5px] text-[#7a6428] leading-[1.6]">
                        구독이 해지되어 다음 갱신 결제가 진행되지 않습니다.
                        서비스는 만료일까지 계속 이용 가능합니다.
                      </p>
                    </div>
                  )}

                  <div className="px-5 sm:px-6 py-4 border-t border-ink-200 flex flex-wrap items-center gap-2">
                    {!isOnPaidPlan && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setPlanPickerOpen(true)}
                        leadingIcon={
                          <Sparkles size={13} strokeWidth={1.75} />
                        }
                      >
                        플랜 업그레이드
                      </Button>
                    )}
                    {isOnPaidPlan && (
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setPlanPickerOpen(true)}
                      >
                        다른 플랜 보기
                      </Button>
                    )}
                    {subscription?.status === "active" &&
                      !subscription.cancel_at_period_end && (
                        <Button
                          variant="ghost"
                          size="md"
                          onClick={handleCancel}
                          disabled={cancelling}
                        >
                          {cancelling ? "해지 중…" : "구독 해지"}
                        </Button>
                      )}
                  </div>
                </div>
              </section>

              {/* ========== INK SECTION ========== */}
              <section>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-eyebrow text-ink-400 mb-1">
                      Ink credits
                    </p>
                    <h2 className="font-display text-[20px] text-ink-800 tracking-[-0.02em]">
                      잉크 충전
                    </h2>
                  </div>
                  {ink && (
                    <div className="text-right">
                      <div className="flex items-baseline gap-1.5 justify-end">
                        <InkIcon
                          size={13}
                          className="text-anima-500"
                        />
                        <p
                          className="font-mono text-ink-800 tabular-nums tracking-[-0.025em]"
                          style={{ fontSize: 22, fontWeight: 500 }}
                        >
                          {ink.total.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-[10.5px] text-ink-400 mt-0.5">
                        구독 {ink.subscription.toLocaleString()} · 충전{" "}
                        {ink.topup.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-[14px] border border-ink-200 bg-paper overflow-hidden">
                  <div className="px-6 py-4 border-b border-ink-200 bg-ink-50/40">
                    <p className="text-[12.5px] text-ink-500 leading-[1.7]">
                      <span className="text-ink-700 font-medium">
                        잉크는 콘텐츠를 만들 때 사용
                      </span>
                      되는 단위입니다. 구독 잉크가 모두 소진된 다음에
                      충전 잉크가 사용되며, 충전한 잉크는 만료되지
                      않습니다.
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {INK_PACKAGES.map((p) => {
                        const isMid = p.id === "ink_regular";
                        return (
                          <Link
                            key={p.id}
                            href={`/ink/checkout/${p.id}`}
                            className={`group relative rounded-[12px] border p-4 transition-colors flex flex-col ${
                              isMid
                                ? "border-ink-800 bg-ink-800 text-ink-50"
                                : "border-ink-200 bg-paper hover:border-ink-300"
                            }`}
                          >
                            <div
                              className={`mb-3 h-[64px] flex items-end ${
                                isMid ? "text-anima-200" : "text-anima-500"
                              }`}
                            >
                              <InkBottle
                                size={
                                  p.id === "ink_small"
                                    ? "small"
                                    : p.id === "ink_large"
                                    ? "large"
                                    : "regular"
                                }
                              />
                            </div>
                            <p
                              className={`font-display text-[15px] tracking-[-0.015em] mb-1 ${
                                isMid ? "text-ink-50" : "text-ink-800"
                              }`}
                            >
                              {p.name}
                            </p>
                            <div className="flex items-baseline gap-1 mb-3">
                              <p
                                className={`font-mono tabular-nums tracking-[-0.025em] ${
                                  isMid ? "text-ink-50" : "text-ink-800"
                                }`}
                                style={{ fontSize: 18, fontWeight: 500 }}
                              >
                                {p.totalInk.toLocaleString()}
                              </p>
                              <span
                                className={`text-[10.5px] ${
                                  isMid ? "text-ink-300" : "text-ink-500"
                                }`}
                              >
                                잉크
                              </span>
                              {p.bonusPercent > 0 && (
                                <span
                                  className={`ml-1 text-[10px] font-medium ${
                                    isMid
                                      ? "text-anima-200"
                                      : "text-anima-700"
                                  }`}
                                >
                                  +{p.bonusPercent}%
                                </span>
                              )}
                            </div>
                            <p
                              className={`mt-auto pt-3 border-t border-current/10 font-display tracking-[-0.02em] flex items-center justify-between ${
                                isMid ? "text-ink-50" : "text-ink-800"
                              }`}
                              style={{ fontSize: 16 }}
                            >
                              <span className="flex items-baseline gap-1.5">
                                {inkDiscountRate > 0 && (
                                  <span
                                    className={`font-mono text-[11px] line-through ${
                                      isMid ? "text-ink-400" : "text-ink-300"
                                    }`}
                                  >
                                    {p.priceLabel}
                                  </span>
                                )}
                                <span>
                                  {formatKRW(
                                    inkPriceForPlan(p.price, activePlanId)
                                  )}
                                </span>
                              </span>
                              <ArrowRight
                                size={12}
                                strokeWidth={1.75}
                                className={
                                  isMid ? "text-anima-200" : "text-ink-500"
                                }
                              />
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* ========== PAYMENT HISTORY ========== */}
              <section>
                <div className="mb-3">
                  <p className="text-eyebrow text-ink-400 mb-1">
                    Payment history
                  </p>
                  <h2 className="font-display text-[20px] text-ink-800 tracking-[-0.02em]">
                    결제 내역
                  </h2>
                </div>

                <div className="rounded-[14px] border border-ink-200 bg-paper overflow-hidden">
                  {payments.length === 0 ? (
                    <p className="px-6 py-8 text-[13px] text-ink-400 text-center">
                      아직 결제 내역이 없습니다.
                    </p>
                  ) : (
                    <ul className="divide-y divide-ink-200">
                      {payments.map((p) => (
                        <li
                          key={p.id}
                          className="px-6 py-3.5 flex items-center justify-between gap-4 text-[13px]"
                        >
                          <div className="min-w-0">
                            <p className="text-ink-700 tabular-nums">
                              {(p.paid_at
                                ? new Date(p.paid_at)
                                : new Date(p.created_at)
                              ).toLocaleString("ko-KR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-[11px] text-ink-400 font-mono mt-0.5 truncate">
                              {p.toss_order_id}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <PaymentStatusBadge status={p.status} />
                            <p className="text-ink-700 font-medium tabular-nums">
                              ₩{p.amount.toLocaleString("ko-KR")}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <p className="text-[12px] text-ink-400 leading-[1.6] text-center pt-2">
                환불을 원하시는 경우{" "}
                <a
                  href="mailto:support@wondercreative.kr"
                  className="underline underline-offset-2 hover:text-ink-700"
                >
                  support@wondercreative.kr
                </a>
                로 문의해주세요. 자세한 사항은{" "}
                <Link
                  href="/refund"
                  className="underline underline-offset-2 hover:text-ink-700"
                >
                  환불정책
                </Link>
                을 확인하세요.
              </p>
            </div>
          )}
        </div>
      </main>

      <PlanPickerModal
        open={planPickerOpen}
        onClose={() => setPlanPickerOpen(false)}
        currentPlan={(subscription?.plan as PlanId) ?? "free"}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <p className="text-[12.5px] text-ink-400 shrink-0">{label}</p>
      <div className="text-right min-w-0">{value}</div>
    </div>
  );
}

function StatusBadge({
  status,
  cancelAtEnd,
}: {
  status: Subscription["status"];
  cancelAtEnd: boolean;
}) {
  if (cancelAtEnd) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(201,169,97,0.12)] text-[#7a6428] text-[11px] font-medium border border-[rgba(201,169,97,0.30)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a961]" />
        해지 예정
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-anima-50 text-anima-700 text-[11px] font-medium border border-anima-200">
        <span className="w-1.5 h-1.5 rounded-full bg-anima-400" />
        활성
      </span>
    );
  }
  if (status === "past_due") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(181,86,74,0.10)] text-[#7c3a31] text-[11px] font-medium border border-[rgba(181,86,74,0.25)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#b5564a]" />
        결제 실패
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-ink-100 text-ink-500 text-[11px] font-medium">
      만료됨
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    succeeded: {
      label: "결제 완료",
      cls: "bg-anima-50 text-anima-700 border border-anima-200",
    },
    failed: {
      label: "실패",
      cls: "bg-[rgba(181,86,74,0.10)] text-[#7c3a31] border border-[rgba(181,86,74,0.25)]",
    },
    cancelled: {
      label: "취소",
      cls: "bg-ink-100 text-ink-500",
    },
    refunded: {
      label: "환불",
      cls: "bg-[rgba(201,169,97,0.12)] text-[#7a6428] border border-[rgba(201,169,97,0.30)]",
    },
    pending: {
      label: "처리 중",
      cls: "bg-ink-100 text-ink-500",
    },
  };
  const m = map[status] ?? { label: status, cls: "bg-ink-100 text-ink-500" };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
