import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { AppPreview } from "./AppPreview";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(196, 211, 184, 0.35) 0%, rgba(251, 250, 247, 0) 70%)",
        }}
      />

      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-20 lg:pt-28 pb-20 lg:pb-28">
        <div className="flex flex-col items-center text-center">
          <span className="text-eyebrow text-anima-600 mb-6 inline-flex items-center gap-2">
            Persona Content Studio
            <span className="w-1 h-1 rounded-full bg-anima-400/60" aria-hidden />
            <span className="text-ink-400 italic normal-case tracking-[0.04em]">
              for Thread
            </span>
          </span>

          <h1
            className="font-display text-ink-800 mb-6 break-keep"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.25,
              letterSpacing: "-0.035em",
              fontWeight: 400,
            }}
          >
            페르소나 설계부터 기획까지,
            <br />
            <span className="italic font-light text-ink-700">
              가장 완벽한 브랜드 콘텐츠 스튜디오
            </span>
            <span className="text-anima-400">.</span>
          </h1>

          <div className="max-w-[600px] text-[15px] sm:text-[16px] text-ink-500 leading-[1.8] mb-10 break-keep">
            <p>
              수백만 원 브랜딩 컨설팅 없이도{" "}
              <br className="sm:hidden" />
              <span className="text-ink-700 font-medium">
                우리 브랜드만의 고유한 색깔
              </span>
              을 구축합니다.
            </p>
            <p className="mt-2.5">
              <span className="text-ink-700 font-medium">단어 몇 개</span>만으로
              톤앤매너가 살아있는 스레드·SNS 콘텐츠를 기획하고 완성해 보세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-20">
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                trailingIcon={<ArrowRight size={16} strokeWidth={1.75} />}
              >
                무료로 시작하기
              </Button>
            </Link>
            <a href="#how">
              <Button variant="ghost" size="lg">
                1분 만에 작동 방식 보기
              </Button>
            </a>
          </div>

          <p className="text-[12px] text-ink-400 mb-12 tracking-[0.02em]">
            신용카드 불필요 · 페르소나 1개 · 월 10개 콘텐츠 무료
          </p>
        </div>

        {/* App preview */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-x-10 -inset-y-6 rounded-[32px] -z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(196, 211, 184, 0.25) 0%, rgba(251, 250, 247, 0) 100%)",
              filter: "blur(40px)",
            }}
          />
          <AppPreview />
        </div>
      </div>
    </section>
  );
}
