import type { Metadata } from "next";
import {
  LegalLayout,
  LegalSection,
  LegalOl,
  LegalUl,
  LegalTable,
} from "@/app/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "개인정보처리방침 — Anima Studio",
  description: "Anima Studio 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Privacy Policy"
      title="개인정보처리방침"
      effectiveDate="2026년 5월 9일"
    >
      <LegalSection number="01" title="총칙">
        <p>
          원더크리에이티브(이하 “회사”)는 「개인정보 보호법」 등 관련 법령상의
          개인정보보호 규정을 준수하며, 회원의 개인정보 보호와 권익을
          보호하기 위해 본 개인정보처리방침을 수립·공개합니다.
        </p>
      </LegalSection>

      <LegalSection number="02" title="수집하는 개인정보의 항목">
        <p>
          회사는 서비스 회원가입 및 이용 과정에서 다음의 개인정보를 수집합니다.
        </p>
        <LegalTable
          headers={["구분", "수집 항목", "수집 방법"]}
          rows={[
            ["회원가입 (필수)", "이메일 주소, 비밀번호", "회원가입 양식"],
            [
              "유료 결제 시 (필수)",
              "결제 정보(카드사, 결제 수단의 일부 정보), 결제 내역",
              "결제 대행사를 통한 수집",
            ],
            [
              "서비스 이용 과정에서 자동 생성",
              "접속 IP, 쿠키, 접속 기기 정보, 서비스 이용 기록",
              "자동 수집",
            ],
            [
              "고객 문의 시 (선택)",
              "이메일 주소, 문의 내용에 포함된 정보",
              "이메일 문의",
            ],
          ]}
        />
      </LegalSection>

      <LegalSection number="03" title="개인정보의 수집 및 이용 목적">
        <LegalOl
          items={[
            <>
              회원 식별 및 본인 확인, 회원 관리, 부정 이용 방지
            </>,
            <>
              서비스 제공 및 운영, 페르소나·콘텐츠 데이터 저장 및 관리
            </>,
            <>
              유료 결제 처리, 환불, 영수증 발행 등 결제 관련 업무
            </>,
            <>
              고객 문의 응대 및 공지사항 전달
            </>,
            <>
              서비스 이용 통계 분석, 신규 기능 개발, 서비스 품질 개선
            </>,
            <>
              관련 법령 및 약관 위반 행위에 대한 대응
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="04" title="개인정보의 보유 및 이용 기간">
        <p>
          회사는 회원의 개인정보를 회원가입 시점부터 회원 탈퇴 시까지
          보유·이용합니다. 다만, 관계 법령에 따라 보존이 필요한 경우 다음과
          같이 일정 기간 보관합니다.
        </p>
        <LegalTable
          headers={["보관 정보", "보관 기간", "근거 법령"]}
          rows={[
            [
              "계약 또는 청약철회 등에 관한 기록",
              "5년",
              "전자상거래법",
            ],
            [
              "대금 결제 및 재화 등의 공급에 관한 기록",
              "5년",
              "전자상거래법",
            ],
            [
              "소비자의 불만 또는 분쟁 처리에 관한 기록",
              "3년",
              "전자상거래법",
            ],
            [
              "웹사이트 접속 기록",
              "3개월",
              "통신비밀보호법",
            ],
          ]}
        />
      </LegalSection>

      <LegalSection number="05" title="개인정보의 제3자 제공">
        <p>
          회사는 회원의 개인정보를 본 방침에서 명시한 범위 내에서만
          처리하며, 회원의 동의가 있거나 관련 법령에 의해 요구되는 경우를
          제외하고 제3자에게 제공하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection number="06" title="개인정보 처리의 위탁">
        <p>
          회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를
          외부 전문 업체에 위탁하고 있습니다.
        </p>
        <LegalTable
          headers={["수탁업체", "위탁 업무 내용", "보유 및 이용 기간"]}
          rows={[
            [
              "Supabase Inc.",
              "회원 인증 및 데이터 저장 인프라 운영",
              "회원 탈퇴 시 또는 위탁 계약 종료 시까지",
            ],
            [
              "Anthropic, PBC.",
              "AI 콘텐츠 생성 처리(API 호출)",
              "API 응답 후 즉시 폐기",
            ],
            [
              "토스페이먼츠 주식회사",
              "결제 처리 및 결제 정보 보관",
              "관련 법령에 따른 보관 기간",
            ],
          ]}
        />
        <p>
          회사는 위탁 계약 체결 시 개인정보보호 관련 법령의 준수, 개인정보에
          관한 비밀유지, 제3자 제공 금지, 사고 시 책임부담 등을 명확히
          규정하고 있습니다.
        </p>
      </LegalSection>

      <LegalSection number="07" title="이용자의 권리와 행사 방법">
        <LegalOl
          items={[
            <>
              회원은 언제든지 본인의 개인정보를 조회·수정할 수 있으며, 회원
              탈퇴를 통해 개인정보의 처리 정지를 요청할 수 있습니다.
            </>,
            <>
              회원은 서비스 내 설정 메뉴를 통해 직접 정보를 수정·삭제할 수
              있으며, 처리 정지를 원할 경우{" "}
              <a
                href="mailto:support@wondercreative.kr"
                className="text-ink-800 underline underline-offset-2 hover:text-anima-600"
              >
                support@wondercreative.kr
              </a>
              로 요청하실 수 있습니다.
            </>,
            <>
              회사는 회원의 요청에 대해 지체 없이 조치하며, 관련 법령에 따라
              일정 기간 보관이 필요한 정보는 그 기간 동안 보관됩니다.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="08" title="개인정보의 파기 절차 및 방법">
        <LegalOl
          items={[
            <>
              회원의 개인정보는 수집 및 이용 목적이 달성되거나 보유 기간이
              경과한 경우 지체 없이 파기합니다.
            </>,
            <>
              전자적 파일 형태로 저장된 개인정보는 복구·재생할 수 없는 기술적
              방법을 사용하여 영구 삭제하며, 종이에 출력된 개인정보는 분쇄기로
              분쇄하거나 소각하여 파기합니다.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="09" title="개인정보의 안전성 확보 조치">
        <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
        <LegalUl
          items={[
            "개인정보의 암호화 저장 및 전송 (HTTPS, TLS)",
            "비밀번호의 단방향 암호화 처리",
            "개인정보 처리 시스템에 대한 접근 권한 관리",
            "개인정보 취급 직원의 최소화 및 교육",
            "해킹 등에 대비한 보안 시스템의 운영",
          ]}
        />
      </LegalSection>

      <LegalSection number="10" title="쿠키의 사용">
        <LegalOl
          items={[
            <>
              회사는 회원의 로그인 상태 유지, 서비스 이용 통계 분석 등을 위해
              쿠키(Cookie)를 사용합니다.
            </>,
            <>
              회원은 사용 중인 웹 브라우저의 옵션을 통해 쿠키 저장을 거부할
              수 있으나, 이 경우 일부 서비스의 이용에 제한이 있을 수
              있습니다.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="11" title="개인정보 보호책임자">
        <LegalUl
          items={[
            <>책임자: 이원준 (대표)</>,
            <>
              연락처:{" "}
              <a
                href="mailto:support@wondercreative.kr"
                className="text-ink-800 underline underline-offset-2 hover:text-anima-600"
              >
                support@wondercreative.kr
              </a>
            </>,
          ]}
        />
        <p>
          개인정보 처리에 관한 민원 또는 침해 신고가 필요한 경우 아래 기관에
          문의하실 수 있습니다.
        </p>
        <LegalUl
          items={[
            "개인정보 침해신고센터 (privacy.kisa.or.kr / 국번 없이 118)",
            "개인정보 분쟁조정위원회 (kopico.go.kr / 1833-6972)",
            "대검찰청 사이버수사과 (spo.go.kr / 국번 없이 1301)",
            "경찰청 사이버수사국 (ecrm.cyber.go.kr / 국번 없이 182)",
          ]}
        />
      </LegalSection>

      <LegalSection number="12" title="개인정보처리방침의 변경">
        <p>
          본 방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의
          추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 회사
          홈페이지를 통해 공지합니다.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
