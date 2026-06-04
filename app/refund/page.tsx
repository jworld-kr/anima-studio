import type { Metadata } from "next";
import {
  LegalLayout,
  LegalSection,
  LegalOl,
  LegalUl,
} from "@/app/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "환불정책 — Anima Studio",
  description: "Anima Studio 환불정책",
};

export default function RefundPage() {
  return (
    <LegalLayout
      eyebrow="Refund Policy"
      title="환불정책"
      effectiveDate="2026년 5월 9일"
    >
      <LegalSection number="01" title="총칙">
        <p>
          본 환불정책은 원더크리에이티브(이하 “회사”)가 운영하는 Anima
          Studio(이하 “서비스”)의 유료 플랜 결제와 관련된 환불 기준 및 절차를
          규정합니다.
        </p>
        <p>
          본 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「콘텐츠
          산업진흥법」 및 관련 법령을 따르며, 본 정책에서 정하지 않은 사항은
          관련 법령 및 회사의 이용약관에 따릅니다.
        </p>
      </LegalSection>

      <LegalSection number="02" title="청약 철회">
        <LegalOl
          items={[
            <>
              회원은 유료 플랜 결제일로부터 7일 이내에 청약을 철회할 수
              있습니다. 다만, 결제 후 서비스를 사용한 흔적이 없는 경우에
              한합니다.
            </>,
            <>
              유료 플랜 결제 후 다음 중 하나라도 해당하는 경우에는 청약 철회가
              제한될 수 있습니다.
              <LegalUl
                items={[
                  "유료 플랜의 기능을 이용하여 콘텐츠를 1건 이상 생성한 경우",
                  "유료 플랜으로만 제공되는 페르소나 한도를 사용한 경우",
                  "결제일로부터 7일이 경과한 경우",
                ]}
              />
            </>,
            <>
              「전자상거래법」 제17조 제2항에 따라 디지털 콘텐츠의 사용이
              개시된 경우 청약 철회가 제한되며, 회사는 결제 화면에 이러한
              사실을 명확히 고지합니다.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="03" title="정기결제 해지">
        <LegalOl
          items={[
            <>
              회원은 서비스 내 설정 메뉴에서 언제든지 정기결제(자동 갱신)를
              해지할 수 있습니다.
            </>,
            <>
              정기결제를 해지하더라도 이미 결제된 기간 동안의 서비스는 만료일
              까지 정상적으로 이용할 수 있습니다.
            </>,
            <>
              해지 이후의 결제는 자동으로 중단되며, 별도의 신청이 없는 한
              회원의 계정은 무료 플랜으로 자동 전환됩니다.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="04" title="환불의 종류와 기준">
        <LegalOl
          items={[
            <>
              <strong className="text-ink-800 font-medium">전액 환불</strong>
              <br />
              결제일로부터 7일 이내이며, 유료 플랜의 기능을 일체 사용하지
              않은 경우 결제 금액 전액을 환불합니다.
            </>,
            <>
              <strong className="text-ink-800 font-medium">
                회사의 귀책사유로 인한 환불
              </strong>
              <br />
              회사의 시스템 장애 등으로 서비스를 제공할 수 없게 된 경우, 사용
              일수를 제외한 잔여 기간에 대한 금액을 환불합니다. 단, 장애 기간이
              24시간을 초과한 경우 회원의 요청에 따라 별도 보상이 이루어질 수
              있습니다.
            </>,
            <>
              <strong className="text-ink-800 font-medium">
                부분 환불(중도 해지)
              </strong>
              <br />
              결제일로부터 7일 경과 후, 회원이 중도 해지를 요청하는 경우
              부분 환불은 제공되지 않으며, 결제된 기간 만료까지 서비스를
              계속 이용할 수 있습니다.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="05" title="환불 제한 사유">
        <p>다음의 경우에는 환불이 제한됩니다.</p>
        <LegalOl
          items={[
            "회원이 유료 플랜의 기능을 사용하여 콘텐츠를 생성한 경우",
            "결제일로부터 7일이 경과한 경우",
            "회원이 본 약관 또는 관련 법령을 위반하여 이용이 제한된 경우",
            "이벤트, 프로모션 등을 통해 무상으로 제공된 서비스 또는 보너스 콘텐츠 한도",
            "기타 관련 법령에 따라 환불이 제한되는 경우",
          ]}
        />
      </LegalSection>

      <LegalSection number="06" title="환불 절차">
        <LegalOl
          items={[
            <>
              환불을 원하는 회원은{" "}
              <a
                href="mailto:support@wondercreative.kr"
                className="text-ink-800 underline underline-offset-2 hover:text-anima-600"
              >
                support@wondercreative.kr
              </a>
              로 결제 정보(이메일, 결제일, 결제 금액)를 함께 보내 환불을
              요청합니다.
            </>,
            <>
              회사는 환불 요청을 접수한 후 영업일 기준 3일 이내에 환불 가능
              여부를 회신합니다.
            </>,
            <>
              환불이 승인된 경우, 결제 수단과 동일한 방법으로 환불됩니다.
              결제 대행사의 정책에 따라 카드사 환불은 영업일 기준 3~7일이
              소요될 수 있습니다.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="07" title="요금 변경 시 환불">
        <p>
          회사가 요금제를 변경하는 경우, 변경 전 결제된 금액에 대해서는 변경
          전 요금이 적용되며, 회원이 원치 않을 경우 잔여 기간에 대한 환불을
          요청할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection number="08" title="문의처">
        <p>환불 및 결제와 관련된 문의는 다음 연락처로 부탁드립니다.</p>
        <LegalUl
          items={[
            <>상호: 원더크리에이티브</>,
            <>대표자: 이원준</>,
            <>사업자등록번호: 678-37-00662</>,
            <>통신판매업 신고번호: 2019-서울용산-1033</>,
            <>사업장 소재지: 서울특별시 용산구 신흥로 25 B1F</>,
            <>
              고객 문의:{" "}
              <a
                href="mailto:support@wondercreative.kr"
                className="text-ink-800 underline underline-offset-2 hover:text-anima-600"
              >
                support@wondercreative.kr
              </a>
            </>,
          ]}
        />
      </LegalSection>
    </LegalLayout>
  );
}
