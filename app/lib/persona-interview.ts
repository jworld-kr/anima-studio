/**
 * Fixed survey schema for the AI-assisted persona builder.
 *
 * Design principles:
 *  - All questions are static (no dynamic LLM generation per question).
 *  - One Sonnet call at the end synthesizes 8 worldbuilding sections.
 *  - Most questions are multiple-choice with rich, grouped options;
 *    free-text input is only required for name/oneline and optional
 *    "직접 추가" extensions on the larger choice sets.
 *
 * 12 questions across 4 sections (12 steps total):
 *   정체성     — mode, name, oneline
 *   타겟 독자  — age, gender, vertical
 *   성격·표현 — traits, expressions, role
 *   콘텐츠·금기 — anti, content_types, taboo
 */

export type SurveyMode = "person" | "brand";

export interface MultiChoiceGroup {
  label: string;
  emoji?: string;
  options: string[];
}

export interface MultiChoiceQuestion {
  id: string;
  kind: "single" | "multi";
  question: string;
  hint?: string;
  groups: MultiChoiceGroup[];
  allowCustom?: boolean;
  customHint?: string;
  customExamples?: string[];
  minSelected?: number;
  maxSelected?: number;
  optional?: boolean;
  /** 강조 박스로 렌더되는 안내(예: 비워두면 AI가 채워준다). **굵게** 지원. */
  assistNote?: string;
}

export interface TextExampleGroup {
  label: string;
  emoji?: string;
  items: string[];
}

export interface TextQuestion {
  id: string;
  kind: "text";
  question: string;
  hint?: string;
  placeholder?: string;
  /** Optional heading shown above the example box. */
  exampleHeading?: string;
  /** Flat example list (used when mode-branching isn't needed). */
  examples?: string[];
  /** Mode-branched, grouped examples. Takes precedence over `examples`. */
  examplesByMode?: {
    person?: TextExampleGroup[];
    brand?: TextExampleGroup[];
  };
  multiline: boolean;
  optional?: boolean;
}

export interface ModeQuestion {
  id: "mode";
  kind: "mode";
  question: string;
  hint?: string;
}

export type SurveyQuestion = ModeQuestion | TextQuestion | MultiChoiceQuestion;

export interface SurveyStep {
  id: string;
  /** Short label shown in the progress indicator. */
  label: string;
  /** Section grouping for the "Step 8 / 13 · 성격" style indicator. */
  section: "정체성" | "타겟 독자" | "성격·표현" | "콘텐츠·금기";
  /** Sub-header shown above the question(s). Optional — many steps don't need one. */
  description?: string;
  questionIds: string[];
}

/**
 * 12-step survey. Each step shows one short question so the user
 * never scrolls more than a single screen.
 */
export const SURVEY_STEPS: SurveyStep[] = [
  {
    id: "start",
    label: "시작",
    section: "정체성",
    description:
      "거창한 준비물은 필요 없습니다. 카톡하듯 가볍게 체크하고 답하다 보면, Anima가 당신의 비즈니스를 분석해 시장에서 살아 숨 쉴 8차원 입체 페르소나를 빚어냅니다. (예상 소요 시간: 2분)",
    questionIds: ["mode"],
  },
  {
    id: "name",
    label: "이름",
    section: "정체성",
    questionIds: ["name"],
  },
  {
    id: "oneline",
    label: "소개",
    section: "정체성",
    questionIds: ["oneline"],
  },
  {
    id: "age",
    label: "연령대",
    section: "타겟 독자",
    description:
      "브랜드의 기본 뼈대가 완성되었습니다. 이제 이 페르소나가 시장에서 누구와 깊은 대화를 나눌지 정해볼까요?",
    questionIds: ["age"],
  },
  {
    id: "gender",
    label: "성별 비중",
    section: "타겟 독자",
    questionIds: ["gender"],
  },
  {
    id: "vertical",
    label: "분야",
    section: "타겟 독자",
    questionIds: ["vertical"],
  },
  {
    id: "traits",
    label: "성격",
    section: "성격·표현",
    description:
      "좋아요, 타겟이 명확해졌습니다! 이제 페르소나에게 가장 중요한 목소리(말투)와 성격을 부여할 차례입니다.",
    questionIds: ["traits"],
  },
  {
    id: "expressions",
    label: "표현",
    section: "성격·표현",
    questionIds: ["expressions"],
  },
  {
    id: "role",
    label: "역할",
    section: "성격·표현",
    questionIds: ["role"],
  },
  {
    id: "anti",
    label: "안티 레퍼런스",
    section: "콘텐츠·금기",
    description:
      "거의 다 왔습니다! 마지막 관문이에요. 브랜드의 안전과 퀄리티를 위해 절대 하지 않을 행동과 다루지 않을 주제를 설정합니다.",
    questionIds: ["anti"],
  },
  {
    id: "taboo",
    label: "금기 주제",
    section: "콘텐츠·금기",
    questionIds: ["taboo"],
  },
];

/* ---------- Q0: mode ---------- */
const MODE_QUESTION: ModeQuestion = {
  id: "mode",
  kind: "mode",
  question: "이 페르소나는 누구를 대변하나요?",
  hint: "어느 쪽이든 이후 질문은 같지만, 예시와 표현이 살짝 달라져요.",
};

/* ---------- Q1, Q2: identity ---------- */
const TEXT_QUESTIONS: Record<string, TextQuestion> = {
  name: {
    id: "name",
    kind: "text",
    question: "페르소나의 이름을 정해볼까요?",
    hint: "사람이라면 활동명이나 필명을, 브랜드라면 가게 상호나 계정명을 적어주세요. 짧을수록 기억하기 좋습니다.",
    placeholder: "예. 오월의 봄, Studio Onset, 에디터 민수",
    multiline: false,
  },
  oneline: {
    id: "oneline",
    kind: "text",
    question: "어떤 일을 하는지 한 줄로만 알려주세요.",
    hint: "완벽한 문장이 아니어도 괜찮아요. 무엇을 만들고 어떤 가치를 전하는지 가볍게 적어주세요.",
    placeholder:
      "예. 성수동에서 스페셜티 커피를 파는 작은 카페 / 마케팅 인사이트를 나누는 크리에이터",
    exampleHeading: "💡 이렇게 적어보세요",
    examplesByMode: {
      person: [
        {
          label: "커리어 · 직장인 인사이트",
          emoji: "💼",
          items: [
            "대기업 7년 차 마케터로 일하며 배운 날것의 마케팅 전략과 커리어 성장 팁을 투명하게 기록하고 나눕니다.",
          ],
        },
        {
          label: "지식창업 · 인플루언서",
          emoji: "🚀",
          items: [
            "퇴사 후 홀로서기를 시작한 1인 창업가입니다. 내 이름 석 자로 스스로 일어서는 법과 비즈니스 마인드셋을 전합니다.",
          ],
        },
        {
          label: "일상 · 에세이 크리에이터",
          emoji: "📝",
          items: [
            "매일 아침 책을 읽고 글을 쓰는 프리랜서 디자이너입니다. 단단한 내면을 만드는 아침 루틴과 영감을 공유합니다.",
          ],
        },
      ],
      brand: [
        {
          label: "F&B · 매장",
          emoji: "☕",
          items: [
            "성수동에서 골목길 작은 스페셜티 커피숍을 운영하며, 일상 속 작은 쉼표가 되는 커피와 디저트를 만듭니다.",
          ],
        },
        {
          label: "디자인 스튜디오 · 에이전시",
          emoji: "🎨",
          items: [
            "작은 브랜드의 성장을 돕는 디자인 에이전시 Studio Onset입니다. 시각적 정체성을 구축해 브랜드의 가치를 시각화합니다.",
          ],
        },
        {
          label: "패션 · 라이프스타일 샵",
          emoji: "👗",
          items: [
            "친환경 소재로 오래 입을 수 있는 기본 티셔츠를 만드는 패션 브랜드입니다. 지속 가능한 의생활을 제안합니다.",
          ],
        },
      ],
    },
    multiline: true,
  },
  taboo: {
    id: "taboo",
    kind: "text",
    question: "콘텐츠로 절대 다루고 싶지 않은 주제가 있나요?",
    hint: "Anima가 기획안을 만들 때 이 주제는 완전히 제외하고 안전하게 필터링합니다. 없으면 비워두셔도 됩니다.",
    placeholder: "예. 정치, 종교, 타 브랜드 비방, 사적인 연애 이야기",
    examples: [
      "정치, 종교, 특정 정치인·정당 언급",
      "다른 가게·브랜드 직접 비교나 비방",
      "개인 가족 얘기, 사적인 인간관계",
      "가격 자랑, 매출 자랑",
      "특정 인종·성별·세대를 일반화하는 농담",
    ],
    multiline: true,
    optional: true,
  },
};

/* ---------- Q3a: age ---------- */
const AGE: MultiChoiceQuestion = {
  id: "age",
  kind: "multi",
  question: "주로 어떤 연령대의 독자와 소통하고 싶으신가요?",
  hint: "내 글에 가장 뜨겁게 반응해 줄 메인 타겟을 1~2개 골라주세요.",
  minSelected: 1,
  maxSelected: 2,
  groups: [
    {
      label: "연령대",
      options: [
        "10대 (Z세대 후반)",
        "20대 초반 (대학생·사회 초년생)",
        "20대 후반 (사회 진입 후 정착기)",
        "30대 초반 (커리어 안정·결혼 진입)",
        "30대 후반 (가정·커리어 도약기)",
        "40대 (중장년 진입)",
        "50대 이상",
        "전 연령 (특정 세대 타겟 아님)",
      ],
    },
  ],
};

/* ---------- Q3b: gender ---------- */
const GENDER: MultiChoiceQuestion = {
  id: "gender",
  kind: "single",
  question: "독자층의 성별 비중은 어떤가요?",
  hint: "스레드는 한국 기준 여성 사용자 비중이 약 6:4로 높습니다.",
  groups: [
    {
      label: "성별 비중",
      options: [
        "여성 위주",
        "여성이 조금 더 많음",
        "성별 무관 반반",
        "남성이 조금 더 많음",
        "남성 위주",
      ],
    },
  ],
};

/* ---------- Q3c: vertical ---------- */
const VERTICAL: MultiChoiceQuestion = {
  id: "vertical",
  kind: "multi",
  question: "우리 브랜드가 속한 메인 카테고리는 어디인가요?",
  hint: "관련된 분야를 최대 3개까지 골라주세요. 내 비즈니스와 가장 가까운 키워드를 고를수록 Anima가 더욱 뾰족한 주제를 제안합니다.",
  minSelected: 1,
  maxSelected: 3,
  allowCustom: true,
  customHint: "💡 원하는 키워드가 없나요? 우리 브랜드만의 개성 있는 버티컬을 직접 적어주셔도 좋습니다. 명사 형태로 짧고 뾰족하게 입력할 때 가장 매력적인 페르소나가 완성됩니다.",
  customExamples: ["수공예", "전통주", "양조·발효", "비건 베이킹"],
  groups: [
    {
      label: "라이프스타일",
      emoji: "🍽",
      options: [
        "F&B (음식·요리·맛집)",
        "카페·디저트",
        "술·바·주류 문화",
        "인테리어·가구·홈데코",
        "패션",
        "뷰티·코스메틱",
        "건강·웰니스·운동",
      ],
    },
    {
      label: "비즈니스·커리어",
      emoji: "💼",
      options: [
        "마케팅·브랜딩",
        "창업·자영업",
        "IT·개발·테크",
        "디자인·크리에이티브",
        "재테크·투자·부동산",
        "직장·커리어 성장",
        "프리랜서·1인 사업",
      ],
    },
    {
      label: "콘텐츠·취향",
      emoji: "🎨",
      options: [
        "책·독서",
        "영화·드라마·OTT",
        "음악",
        "미술·전시·공연",
        "사진·영상",
        "글쓰기",
      ],
    },
    {
      label: "일상·가족",
      emoji: "🌱",
      options: [
        "육아·교육",
        "반려동물",
        "식물·가드닝",
        "여행",
        "자기계발·심리",
      ],
    },
    {
      label: "엔터·서브컬처",
      emoji: "🎮",
      options: ["게임", "만화·웹툰·애니", "아이돌·K-pop", "스포츠"],
    },
    {
      label: "전문 영역",
      emoji: "📚",
      options: [
        "헬스케어·의료",
        "법률",
        "교육",
        "환경·지속가능성",
        "종교·영성",
      ],
    },
  ],
};

/* ---------- Q5: traits (40 options grouped) ---------- */
const TRAITS: MultiChoiceQuestion = {
  id: "traits",
  kind: "multi",
  question: "이 페르소나는 어떤 성격을 가졌나요?",
  hint: "우리 브랜드를 사람으로 시각화했을 때 어울리는 성격 조각들을 골라주세요. 다중 선택이 가능합니다.",
  minSelected: 3,
  allowCustom: true,
  customHint: "💡 우리 브랜드만의 독특한 성격이 있나요? 아래 예시처럼 ~한, ~있는 형태의 형용사로 짧게 적어주세요. Anima가 우리 브랜드의 말투에 더 정확하게 반영할 수 있습니다.",
  customExamples: ["자유로운", "소탈한", "자신감 넘치는", "차도녀 같은"],
  groups: [
    {
      label: "분위기·태도",
      emoji: "🌊",
      options: [
        "차분한",
        "신중한",
        "진지한",
        "단단한",
        "무게감 있는",
        "담백한",
        "절제된",
        "뚝심 있는",
      ],
    },
    {
      label: "에너지·표현",
      emoji: "🔥",
      options: [
        "솔직한",
        "직설적인",
        "거침없는",
        "열정적인",
        "주관이 뚜렷한",
        "날카로운",
        "단호한",
        "냉철한",
      ],
    },
    {
      label: "관계·소통",
      emoji: "🌱",
      options: [
        "다정한",
        "공감하는",
        "따뜻한",
        "친근한",
        "배려 깊은",
        "사교적인",
        "장난기 많은",
        "든든한",
      ],
    },
    {
      label: "유머·센스",
      emoji: "🎭",
      options: [
        "위트 있는",
        "능청스러운",
        "시니컬한",
        "유쾌한",
        "엉뚱한",
        "센스 있는",
      ],
    },
    {
      label: "깊이·시선",
      emoji: "✨",
      options: [
        "통찰력 있는",
        "호기심 많은",
        "관찰력 좋은",
        "디테일에 강한",
        "본질을 파고드는",
        "트렌디한",
      ],
    },
    {
      label: "태도·일하는 방식",
      emoji: "🎯",
      options: [
        "꾸준한",
        "완벽주의",
        "효율적인",
        "실용적인",
        "도전적인",
        "끈질긴",
        "전문적인",
        "성장 지향적인",
      ],
    },
    {
      label: "취향·정서",
      emoji: "🌙",
      options: [
        "감성적인",
        "낭만적인",
        "미니멀한",
        "빈티지한",
        "모던한",
        "힙한",
        "자연 친화적인",
        "클래식한",
      ],
    },
  ],
};

/* ---------- Q6: expressions (40+ options grouped, includes 질문 던지기 group) ---------- */
const EXPRESSIONS: MultiChoiceQuestion = {
  id: "expressions",
  kind: "multi",
  question: "내 피드에 꼭 녹이고 싶은 문장 스타일이 있나요?",
  hint: "자주 쓰는 문구나 말버릇을 골라주세요. (다중 선택 가능)",
  assistNote:
    "고르기 어렵다면 **그냥 비워두고 넘어가도 괜찮아요.**\nAnima가 앞선 답변을 분석해 어울리는 말투 표현을 **4~5개 알아서 채워드려요.**",
  optional: true,
  allowCustom: true,
  customHint: "💡 나만 쓰는 독특한 표현이나 자주 붙이는 문장 부호가 있나요? 카톡이나 댓글을 쓸 때 나도 모르게 자주 사용하는 단어와 문구를 편하게 적어주세요. 쉼표(,)로 구분해서 툭툭 던져주시면 좋습니다.",
  customExamples: ["~라는 뜻", "ㅠㅠ", "🔥", "암튼", "개추"],
  groups: [
    {
      label: "운을 떼는 말",
      emoji: "💭",
      options: [
        "솔직히 말하면",
        "사실은",
        "그러니까",
        "근데 있잖아",
        "결국엔",
        "그게 뭐냐면",
        "지나고 보니",
        "어라?",
      ],
    },
    {
      label: "의견 던질 때",
      emoji: "🎯",
      options: [
        "내 생각엔",
        "개인적으로",
        "단언컨대",
        "굳이 말하자면",
        "까놓고 말해서",
        "진심으로",
        "무조건",
        "핵심은",
      ],
    },
    {
      label: "동의·공감 유도",
      emoji: "🤔",
      options: [
        "맞아 맞아",
        "그러게",
        "나도 그래",
        "너만 그런 거 아냐",
        "진짜 공감",
        "나만 불편해?",
        "그치?",
      ],
    },
    {
      label: "위트·자조 (유쾌한 반성)",
      emoji: "🪞",
      options: [
        "나만 몰랐나",
        "또 시작이네",
        "어, 이거 내 얘기네",
        "정신 차리자",
        "내 잘못이지 뭐",
        "인생 역주행 중",
      ],
    },
    {
      label: "질문 던지기",
      emoji: "❓",
      options: [
        "근데 진짜?",
        "나만 이래?",
        "이거 왜 이런 거야?",
        "뭔지 알지?",
        "이거 본 적 있어?",
        "다들 어떻게 해?",
      ],
    },
    {
      label: "정보·팁 요약",
      emoji: "📊",
      options: [
        "결론부터",
        "짧게 말하면",
        "핵심만",
        "한 줄 요약",
        "정리하면",
        "이거 하나만",
        "팩트는",
      ],
    },
    {
      label: "독자 호명",
      emoji: "💬",
      options: [
        "우리 [업종]들",
        "여러분",
        "다들",
        "모두",
        "친구들",
        "(호명하지 않음)",
      ],
    },
    {
      label: "마무리·여운",
      emoji: "⏱",
      options: [
        "그런 거 있잖아",
        "어쩌면",
        "그래서 그런가",
        "모르겠다",
        "그뿐이다",
        "그게 다야",
        "끝.",
      ],
    },
    {
      label: "문장 부호·형식 습관",
      emoji: "🛠️",
      options: [
        "줄바꿈(엔터) 자주 하기",
        "문장 끝에 마침표(.) 안 찍기",
        "~음, ~함 체 쓰기",
        "영어/외래어 섞어 쓰기",
        "느낌표(!)나 물음표(?) 자주 쓰기",
        "중요한 단어에 '따옴표' 쓰기",
        "이모지(콘) 전혀 안 쓰기",
      ],
    },
  ],
};

/* ---------- Q-role ---------- */
const ROLE: MultiChoiceQuestion = {
  id: "role",
  kind: "single",
  question: "독자들에게 우리 브랜드는 어떤 존재가 되고 싶나요?",
  hint: "페르소나가 취할 콘텐츠의 핵심 정체성을 골라주세요. 이 역할에 따라 전체적인 콘텐츠의 메시지 방향성이 결정됩니다.",
  groups: [
    {
      label: "콘텐츠 역할",
      options: [
        "🧑‍🤝‍🧑 다정한 친구 (공감·소통형) — 동네 친구처럼 편안하게 소통하고, 내밀한 고민에 깊이 공감해 주는 친근한 존재",
        "👨‍🏫 든든한 멘토 (지식·인사이트형) — 검증된 정보와 날카로운 인사이트를 바탕으로 유용한 지식을 나누는 전문가",
        "🏃 페이스메이커 (성장·기록형) — 시행착오를 겪으며 우당탕탕 성장하는 과정을 투명하게 공유하며 자극을 주는 러너",
        "🎨 큐레이터 (취향·철학형) — 확고한 안목과 독창적인 취향을 바탕으로 새로운 라이프스타일을 제안하는 아티스트",
        "📢 위트 있는 리더 (트렌드·오피니언형) — 시장의 흐름을 짚어내고 유쾌하게 담론을 이끄는 매력적인 트렌드세터",
        "🪵 이야기꾼 (스토리텔링형) — 브랜드 비하인드, 일상의 사소한 사건들을 한 편의 소설처럼 몰입감 있게 들려주는 스토리텔러",
      ],
    },
  ],
};

/* ---------- Q-anti ---------- */
const ANTI: MultiChoiceQuestion = {
  id: "anti",
  kind: "multi",
  question: "내 피드에서 '이런 모습만큼은 절대 보이고 싶지 않다' 하는 성향은 무엇인가요?",
  hint: "피하고 싶은 모습을 골라주세요. Anima가 이 답변을 역으로 분석해, 우리 브랜드가 절대 타협하지 않을 '고유의 신념과 가치관'을 도출해 냅니다. (다중 선택 가능)",
  allowCustom: true,
  customHint: "💡 나만의 콘텐츠 철학이나 절대 용납할 수 없는 스타일이 있나요? 내 피드에서만큼은 꼭 지키고 싶은 선을 단어나 문구로 적어주세요. 쉼표(,)로 구분해서 툭툭 던져주시면 좋습니다.",
  customExamples: [
    "잦은 맞춤법 실수",
    "자문자답 후기 조작",
    "불펌 및 짜깁기",
    "구걸하는 듯한 팔로우 요청",
  ],
  groups: [
    {
      label: "콘텐츠 안티 패턴",
      emoji: "🚫",
      options: [
        "✍️ 어려운 지식 자랑",
        "🌪️ 줏대 없는 트렌드 추종",
        "📢 과도한 홍보·광고",
        "🎈 알맹이 없는 가벼움",
        "🪵 지루하고 딱딱함",
        "👑 무의미한 실적 과시",
        "🥊 타 브랜드 비방",
        "💤 뻔한 클리셰 반복",
        "😭 과도한 감정 과잉",
        "☕ 알맹이 없는 감성 글귀",
      ],
    },
  ],
};

export const SURVEY_QUESTIONS: Record<string, SurveyQuestion> = {
  mode: MODE_QUESTION,
  name: TEXT_QUESTIONS.name,
  oneline: TEXT_QUESTIONS.oneline,
  age: AGE,
  gender: GENDER,
  vertical: VERTICAL,
  traits: TRAITS,
  expressions: EXPRESSIONS,
  role: ROLE,
  anti: ANTI,
  taboo: TEXT_QUESTIONS.taboo,
};

export type SurveyAnswer =
  | { id: string; kind: "mode"; value: SurveyMode }
  | { id: string; kind: "text"; value: string }
  | {
      id: string;
      kind: "single" | "multi";
      selected: string[];
      custom?: string;
    };

export type SurveyAnswers = Record<string, SurveyAnswer>;

export function isAnswered(q: SurveyQuestion, a: SurveyAnswer | undefined): boolean {
  if (!a) return !!q.kind && "optional" in q ? !!(q as any).optional : false;
  switch (a.kind) {
    case "mode":
      return a.value === "person" || a.value === "brand";
    case "text":
      return a.value.trim().length > 0;
    case "single":
      return a.selected.length === 1;
    case "multi":
      return (
        a.selected.length > 0 || (!!a.custom && a.custom.trim().length > 0)
      );
  }
}
