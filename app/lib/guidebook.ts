/**
 * Anima 가이드북 콘텐츠. 원문 그대로.
 * 콘텐츠 작성 화면의 "Anima 가이드북" 모달에서 렌더된다.
 */

export const GUIDE_INTRO = {
  eyebrow: "Anima Studio",
  sectionNo: "1.",
  welcome: "Anima 스튜디오에 오신 것을 환영합니다",
  quote: "당신의 브랜드가 가진 고유의 목소리, 단어 하나로 시작됩니다.",
  body: "Anima 스튜디오는 브랜드 및 퍼스널 브랜딩을 진행하는 크리에이터를 위한 가장 영리한 콘텐츠 작성 도구입니다. 특히 스레드(Threads) 같은 텍스트 중심의 SNS에서 우리 브랜드만의 색깔을 담은 글을 지속적으로 발행할 수 있도록 돕습니다.",
  highlights: ["가장 영리한 콘텐츠 작성 도구", "우리 브랜드만의 색깔"],
};

export interface GuideWhy {
  title: string;
  body: string;
  highlights?: string[];
}

export const GUIDE_WHY_HEADING = "Anima 스튜디오는 왜 다를까요?";

export const GUIDE_WHY: GuideWhy[] = [
  {
    title: "흔들리지 않는 고유의 목소리",
    body: "Anima 스튜디오의 핵심은 '페르소나'입니다. 브랜드의 정체성, 타깃 독자, 말투를 한 번만 설정해 두면 Anima가 그 톤앤매너를 완벽하게 학습합니다. 담당자가 바뀌거나 외주를 맡겨도 브랜드의 목소리가 한결같이 유지되어, 마치 우리 브랜드 전담 에디터나 작은 대행사를 한 명 둔 것 같은 효과를 줍니다.",
    highlights: [
      "'페르소나'",
      "톤앤매너를 완벽하게 학습",
      "담당자가 바뀌거나 외주를 맡겨도 브랜드의 목소리가 한결같이 유지",
    ],
  },
  {
    title: "양산형 콘텐츠와의 결별",
    body: "저희는 콘텐츠를 무의미하게 찍어내는 자동화 도구가 아닙니다. Anima는 든든한 초안 작성자일 뿐, 최종 발행과 검수는 언제나 사람(사용자)이 통제합니다. 빠르게 대량 양산하는 게 아니라, 사람이 통제하면서 진짜 가치 있는 콘텐츠를 골라 다듬도록 설계되었습니다.",
    highlights: [
      "자동화 도구가 아닙니다",
      "최종 발행과 검수는 언제나 사람(사용자)이 통제",
    ],
  },
];

export const GUIDE_STEPS_HEADING = "Anima 스튜디오 100% 활용하는 4단계 사용법";
export const GUIDE_STEPS_INTRO =
  "우리 브랜드의 디지털 페르소나를 만들고, 첫 번째 콘텐츠를 발행하기까지의 과정을 안내합니다.";

export interface GuideSubItem {
  label: string;
  body: string;
  highlights?: string[];
}

export interface GuideStep {
  index: string;
  title: string;
  paren: string;
  lead: string;
  leadHighlights?: string[];
  items: GuideSubItem[];
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    index: "1단계",
    title: "페르소나 설정",
    paren: "내 브랜드의 정체성 부여하기",
    lead: "콘텐츠를 만들기 전, Anima에게 우리 브랜드의 영혼을 불어넣는 단계입니다.",
    leadHighlights: ["우리 브랜드의 영혼을 불어넣는"],
    items: [
      {
        label: "설정 방법",
        body: "앱이 제시하는 직관적인 질문(브랜드의 핵심 가치, 타깃 독자의 연령/관심사, 추구하는 성격과 말투 등)에 답변하기만 하면 됩니다.",
      },
      {
        label: "지속성 및 수정",
        body: "한 번 구축된 페르소나는 모든 콘텐츠 생성의 기준이 되며, 브랜드의 성장 방향에 맞춰 언제든 자유롭게 수정하고 보완할 수 있습니다.",
      },
    ],
  },
  {
    index: "2단계",
    title: "주제 생성",
    paren: "반짝이는 아이디어 10개 뽑아내기",
    lead: "가장 핵심이 되는 생각의 줄기를 입력하여 콘텐츠의 씨앗을 만드는 단계입니다. 긴 문장이나 완벽한 카피를 쓰려고 고민하지 마세요. 오늘 있었던 일, 머릿속에 맴도는 단어를 카톡 보내듯 키워드로 툭 던지면, Anima가 페르소나 톤에 맞춘 매력적인 주제 10개를 순식간에 제안합니다.",
    leadHighlights: [
      "긴 문장이나 완벽한 카피를 쓰려고 고민하지 마세요",
      "키워드로 툭 던지면",
      "주제 10개를 순식간에 제안",
    ],
    items: [],
  },
  {
    index: "3단계",
    title: "주제 관리",
    paren: "나만의 아이디어 창고 구축하기",
    lead: "Anima가 제안한 10개의 주제 중, 실제로 콘텐츠로 발전시키고 싶은 알짜배기 아이디어를 선별하는 단계입니다.",
    leadHighlights: ["알짜배기 아이디어를 선별"],
    items: [
      {
        label: "선택적 저장",
        body: "마음에 드는 주제만 골라서 저장할 수 있어, 피드가 쓸데없는 초안으로 복잡해지는 것을 막아줍니다. 빠르게 많이 양산하는 것보다 좋은 것을 고르는 시스템입니다.",
      },
      {
        label: "라벨링 시스템",
        body: "저장된 주제는 카테고리별 라벨로 깔끔하게 분류되어, 당장 쓰지 않더라도 나중에 아이디어가 고갈되었을 때 언제든 다시 꺼내어 활용할 수 있습니다.",
      },
    ],
  },
  {
    index: "4단계",
    title: "콘텐츠 작성 및 발행",
    paren: "마침표 찍기",
    lead: "보관함에 저장해 둔 주제를 바탕으로 마침내 완성도 높은 한 편의 글을 짓는 단계입니다.",
    leadHighlights: ["완성도 높은 한 편의 글"],
    items: [
      {
        label: "맞춤형 초안 생성",
        body: "원하는 글의 개수, 길이, 그리고 유도할 반응을 선택합니다.",
      },
      {
        label: "유도할 반응 종류",
        body: "공감 (독자의 감정 자극) / 발견 (새로운 인사이트 제공) / 신뢰 (전문성 어필) / 행동 (구매 및 참여 유도)",
      },
      {
        label: "최종 검토 및 발행",
        body: "Anima가 완성한 글을 발행하기 전, 눈으로 가볍게 확인하는 단계입니다. 초안이 마음에 든다면 클릭 한 번으로 바로 발행해도 좋고, 브랜드 톤에 맞게 한두 줄만 살짝 수정해서 올릴 수도 있습니다.",
        highlights: [
          "클릭 한 번으로 바로 발행",
          "한두 줄만 살짝 수정",
        ],
      },
      {
        label: "히스토리 관리",
        body: "발행이 완료된 콘텐츠는 '히스토리'에 차곡차곡 기록되어, 지난 콘텐츠의 흐름을 한눈에 파악할 수 있습니다.",
      },
    ],
  },
];

/* ── 2단계 안 — 핵심 팁 ── */
export const GUIDE_TIP_TITLE = "💡 핵심 팁: 멋진 문장은 Anima가 만듭니다. 당신은 '소재'만 던지세요!";
export const GUIDE_TIP_BODY =
  "거창하고 뻔한 이야기보다 '실제로 있었던 우리만의 일'을 가볍게 적어줄 때 가장 반응이 좋은 콘텐츠가 나옵니다. 내 브랜드 유형에 맞는 키워드 예시를 보고, 오늘 기억에 남는 단어 몇 개만 입력해 보세요.";

export interface KeywordExample {
  inputLabel: string;
  input: string;
  outputs: string[];
}

export interface ExampleGroup {
  emoji: string;
  label: string;
  caption: string;
  items: KeywordExample[];
}

export const GUIDE_EXAMPLES: ExampleGroup[] = [
  {
    emoji: "🏢",
    label: "[유형 1] 비즈니스 브랜드",
    caption: "F&B, 패션, 라이프스타일 등",
    items: [
      {
        inputLabel: "손님 에피소드",
        input: "3년 단골 캔커피",
        outputs: [
          "3년 단골손님이 수줍게 건네준 캔커피 하나에 눈물 날 뻔한 썰",
          "단골들의 사랑을 먹고 자라는 우리 매장 이야기",
        ],
      },
      {
        inputLabel: "우당탕탕 운영기",
        input: "단체 주문 30분 늦음",
        outputs: [
          "오픈 이래 첫 배달 사고, 식은땀 흘리며 배운 브랜드의 책임감",
          "실수를 대하는 우리 브랜드의 자세",
        ],
      },
      {
        inputLabel: "제품 개발 비하인드",
        input: "친환경 패키지 단가 고민",
        outputs: [
          "환경을 생각하자니 지갑이 울고... 친환경 패키지 도입 잔혹사",
          "보이지 않는 곳까지 고집 부리는 이유",
        ],
      },
    ],
  },
  {
    emoji: "👤",
    label: "[유형 2] 퍼스널 브랜딩",
    caption: "인플루언서, 전문가, 크리에이터",
    items: [
      {
        inputLabel: "성장과 실패의 기록",
        input: "퇴사 1년 최고 매출",
        outputs: [
          "회사 밖은 지옥이라더니? 퇴사 1년 만에 커리어 하이 찍은 비결",
          "홀로서기 365일 동안 느낀 솔직한 소회",
        ],
      },
      {
        inputLabel: "머리를 친 깨달음",
        input: "후배 팩폭 요즘 트렌드",
        outputs: [
          "MZ 후배한테 '선배 고인물 같아요' 소리 듣고 머리 띵했던 순간",
          "트렌드를 놓치지 않기 위한 나의 발버둥",
        ],
      },
      {
        inputLabel: "사소한 루틴",
        input: "출근길 20분 멍때리기",
        outputs: [
          "스마트폰 중독자가 아침 20분간 화면을 끄면 생기는 일",
          "도파민 디톡스로 하루 생산성 2배 올리기",
        ],
      },
    ],
  },
];

/* ── 2단계 안 — Input/Output 요약 테이블 ── */
export const GUIDE_IO_HEADING = {
  input: "📥 사용자는 키워드만 입력 (Input)",
  output: "📤 Anima가 뽑아내는 디테일한 주제 (Output)",
};

export interface IORow {
  input: string;
  output: string;
}

export const GUIDE_IO_ROWS: IORow[] = [
  {
    input: "탄맛 컴플레인 원두 설명",
    output:
      "오늘 아침 '커피에서 탄 맛 나요'라는 컴플레인을 반갑게 맞이한 이유 (원두 이야기)",
  },
  {
    input: "새벽 2시 야식 송장출력",
    output: "오픈 전날 새벽 2시, 거실 불을 켜둔 채 송장 뽑다 눈 마주친 사연",
  },
  {
    input: "첫 수입 10만원",
    output:
      "퇴사하고 내 이름 석 자로 통장에 첫 10만 원이 찍혔을 때의 솔직한 기분",
  },
];

/* ── 마무리 ── */
export const GUIDE_OUTRO_LABEL = "에디터의 한마디";
export const GUIDE_OUTRO =
  "문맥이나 문법은 신경 쓰지 마세요. 단어 몇 개만 조합해서 던져도, 우리 브랜드 전담 에디터(Anima)가 찰떡같이 알아듣고 완벽한 후킹이 들어간 기획안을 대령하니까요! 지금 바로 첫 키워드를 입력해 보세요.";
