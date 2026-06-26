/**
 * Brand consulting survey schema for the AI persona builder.
 *
 * Design principles:
 *  - 5 open-ended questions (서술형) instead of multiple-choice.
 *  - One Sonnet call at the end synthesizes all 8 worldbuilding sections.
 *  - Claude acts as brand consultant, diagnosing persona from brand story.
 *
 * 7 steps: mode → name → why → difference → audience → strength → worst
 */

export type SurveyMode = "person" | "brand";

export interface TextExampleGroup {
  label: string;
  emoji?: string;
  items: string[];
}

export interface TextQuestion {
  id: string;
  kind: "text";
  question: string;
  questionByMode?: { person?: string; brand?: string };
  hint?: string;
  hintByMode?: { person?: string; brand?: string };
  placeholder?: string;
  placeholderByMode?: { person?: string; brand?: string };
  exampleHeading?: string;
  examples?: string[];
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

export type SurveyQuestion = ModeQuestion | TextQuestion;

export interface SurveyStep {
  id: string;
  label: string;
  section: "시작" | "브랜드 컨설팅";
  description?: string;
  questionIds: string[];
}

export const SURVEY_STEPS: SurveyStep[] = [
  {
    id: "start",
    label: "시작",
    section: "시작",
    description:
      "Anima가 직접 브랜드를 분석해서 페르소나를 만들어드려요. 성의 있게 솔직하게 적을수록 살아있는 페르소나가 나와요. 예상 소요: 3분",
    questionIds: ["mode"],
  },
  {
    id: "name",
    label: "이름",
    section: "시작",
    questionIds: ["name"],
  },
  {
    id: "why",
    label: "시작 이유",
    section: "브랜드 컨설팅",
    description:
      "진짜 이야기를 꺼낼수록 페르소나가 살아있어집니다. 생각나는 대로 편하게 적어줘요.",
    questionIds: ["why"],
  },
  {
    id: "difference",
    label: "차별점",
    section: "브랜드 컨설팅",
    questionIds: ["difference"],
  },
  {
    id: "audience",
    label: "타겟",
    section: "브랜드 컨설팅",
    questionIds: ["audience"],
  },
  {
    id: "strength",
    label: "강점",
    section: "브랜드 컨설팅",
    questionIds: ["strength"],
  },
  {
    id: "worst",
    label: "지양점",
    section: "브랜드 컨설팅",
    questionIds: ["worst"],
  },
];

/* ---------- Q0: mode ---------- */
const MODE_QUESTION: ModeQuestion = {
  id: "mode",
  kind: "mode",
  question: "이 페르소나는 누구를 대변하나요?",
  hint: "어느 쪽이든 이후 질문은 같지만, 예시와 표현이 살짝 달라져요.",
};

/* ---------- Q1: name ---------- */
const NAME_QUESTION: TextQuestion = {
  id: "name",
  kind: "text",
  question: "이름이 뭐야?",
  questionByMode: {
    person: "계정 이름이 뭐야?",
    brand: "브랜드 이름이 뭐야?",
  },
  hintByMode: {
    person: "활동명, 필명, 계정 닉네임. 짧을수록 기억하기 좋아.",
    brand: "상호명, 브랜드명, 계정 이름. 짧을수록 기억하기 좋아.",
  },
  placeholder: "예. 에디터 민수, Studio Onset, 성수 필터커피",
  multiline: false,
};

/* ---------- Q2: why ---------- */
const WHY_QUESTION: TextQuestion = {
  id: "why",
  kind: "text",
  question: "왜 시작했어?",
  questionByMode: {
    person: "이 계정, 왜 시작했어?",
    brand: "이 브랜드, 왜 시작했어?",
  },
  hintByMode: {
    person:
      "남들 다 하니까 숙제처럼 하는 거 말고 진짜 이유 말이야. 기존 피드들을 보다가 유독 불편하고 아쉬웠던 게 있었거나, 꼭 세상에 던지고 싶었던 나만의 기회가 있었을 것 같아. 아주 사소한 계기라도 좋으니 너의 진짜 첫 마음을 들려줘.",
    brand:
      "남들 다 하니까 대세 따라서 만든 거 말고 진짜 이유 말이야. 기존 시장에서 유독 불편했던 게 있었거나, 꼭 세상에 보여주고 싶었던 기회가 있었을 것 같아. 아주 사소한 계기라도 좋으니 사장님의 진짜 첫 마음을 들려줘.",
  },
  exampleHeading: "💡 Anima's Guide",
  examplesByMode: {
    person: [
      {
        label: "",
        items: [
          "프리랜서 디자이너로 살면서 겪는 날것의 생존기를 공유하고 싶었어. 다들 성공한 모습만 보여주니까 오히려 진짜 정보가 없더라고.",
        ],
      },
    ],
    brand: [
      {
        label: "",
        items: [
          "성수동에서 필터커피 내려. 대형 프랜차이즈의 숨 막히는 효율이 싫어서, 일부러 속도를 늦추는 공간을 만들고 싶었거든.",
        ],
      },
    ],
  },
  multiline: true,
};

/* ---------- Q3: difference ---------- */
const DIFFERENCE_QUESTION: TextQuestion = {
  id: "difference",
  kind: "text",
  question: "뭐가 달라?",
  questionByMode: {
    person: "뻔하디뻔한 다른 계정들이랑 뭐가 달라?",
    brand: "뻔하디뻔한 다른 브랜드들이랑 뭐가 달라?",
  },
  hintByMode: {
    person:
      "혹은 기필코 어떻게 달라야 한다고 생각해? 이 분야에서 다들 하는 방식 중 솔직히 마음에 안 들었던 부분이나, 오직 너만 고집하고 있는 '선'이 있다면 덤덤하게 자랑해 줘.",
    brand:
      "혹은 기필코 어떻게 달라야 한다고 생각해? 업계에서 다들 하는 방식 중 솔직히 마음에 안 들었던 부분이나, 오직 우리 브랜드만 고집하고 있는 '선'이 있다면 덤덤하게 자랑해 줘.",
  },
  exampleHeading: "💡 Anima's Guide",
  examplesByMode: {
    person: [
      {
        label: "",
        items: [
          "남들은 있어 보이는 포트폴리오만 올릴 때, 난 클라이언트한테 까인 찌질한 비하인드랑 수정한 과정까지 다 오픈해. 이게 내 곤조니까.",
        ],
      },
    ],
    brand: [
      {
        label: "",
        items: [
          "남들은 원두 마진 남기려고 카피 제품 쓸 때, 우린 계절마다 소량으로 직수입 원두만 고집해. 미련해 보인대도 이게 우리 브랜드 곤조니까.",
        ],
      },
    ],
  },
  multiline: true,
};

/* ---------- Q4: audience ---------- */
const AUDIENCE_QUESTION: TextQuestion = {
  id: "audience",
  kind: "text",
  question: "이 피드에 와서 '서성거렸으면' 하는 사람들, 누군데?",
  questionByMode: {
    brand: "우리 브랜드 주변을 '서성거렸으면' 하는 사람들, 누군데?",
  },
  hint: "뻔한 나이나 직업 정보는 안 중요해. 그 사람들이 요즘 밤마다 '뭐 때문에 잠 못 자고 힘들어하는지', 마음속 깊이 '진짜 갈망하는 게 뭔지' 그 뾰족한 상황을 짚어줘.",
  exampleHeading: "💡 Anima's Guide",
  examplesByMode: {
    person: [
      {
        label: "",
        items: [
          "매일 내 작업물이 맞나 의심 들고 조급해하는 주니어 디자이너들. 남들 속도에 치여서 온전한 내 중심을 잡고 싶은 크리에이터들.",
        ],
      },
    ],
    brand: [
      {
        label: "",
        items: [
          "치열하게 효율만 따지는 직장에 지쳐서, 잠시라도 스마트폰 내려놓고 온전한 우리만의 아지트나 쉼표가 간절한 2030 직장인들.",
        ],
      },
    ],
  },
  multiline: true,
};

/* ---------- Q5: strength ---------- */
const STRENGTH_QUESTION: TextQuestion = {
  id: "strength",
  kind: "text",
  question: "여기서 제일 자신 있게 털어놓을 수 있는 '밑천'이 뭐야?",
  hintByMode: {
    person:
      "밤새워 떠들 수 있을 만큼 직접 온몸으로 부딪쳐 본 경험이나, 남들보다 확실하게 꿰뚫고 있는 주제가 궁금해. 너의 흑역사나 실패담이어도 좋고, 가장 깊은 덕질의 영역이어도 좋아.",
    brand:
      "밤새워 떠들 수 있을 만큼 직접 온몸으로 부딪쳐 본 경험이나, 남들보다 확실하게 꿰뚫고 있는 브랜드의 주제가 궁금해. 제품을 만들며 겪은 실패담이어도 좋고, 가장 깊은 전문성의 영역이어도 좋아.",
  },
  exampleHeading: "💡 Anima's Guide",
  examplesByMode: {
    person: [
      {
        label: "",
        items: [
          "디자인 전공 안 하고 맨땅에 헤딩해서 첫 외주 따낸 이야기, 혼자 일하며 멘탈 관리하는 나만의 루틴.",
        ],
      },
    ],
    brand: [
      {
        label: "",
        items: [
          "카페 오픈 첫 달 매출 처참했던 이야기, 기계 없이 손으로 내리는 필터커피만의 맛과 공간 무드.",
        ],
      },
    ],
  },
  multiline: true,
};

/* ---------- Q6: worst ---------- */
const WORST_QUESTION: TextQuestion = {
  id: "worst",
  kind: "text",
  question: "절대 되기 싫은 느낌이 있어?",
  questionByMode: {
    person: '"이런 느낌의 계정은 죽어도 되기 싫다" 하는 워스트가 있어?',
    brand: '"이런 느낌의 브랜드는 죽어도 되기 싫다" 하는 워스트가 있어?',
  },
  hintByMode: {
    person:
      "피드 넘겨보다가 유독 너의 눈에 거슬리는 톤이나 분위기, 알맹이 없는 방식이 있다면 솔직하게 말해줘. 그 선을 피해 가야 너만의 오리지널리티가 선명해지거든.",
    brand:
      "피드 넘겨보다가 유독 사장님 눈에 거슬리는 톤이나 분위기, 알맹이 없는 방식이 있다면 솔직하게 말해줘. 그 선을 피해 가야 우리 브랜드만의 오리지널리티가 선명해지거든.",
  },
  exampleHeading: "💡 Anima's Guide",
  examplesByMode: {
    person: [
      {
        label: "",
        items: [
          "영혼 없이 로봇이 찍어낸 것 같은 양산형 AI 글, 가르치려 드는 꼰대 같은 훈수 피드, 겉만 번지르르하고 알맹이 없는 인사이트 호소글.",
        ],
      },
    ],
    brand: [
      {
        label: "",
        items: [
          "영혼 없이 로봇이 찍어낸 것 같은 양산형 AI 글, 대놓고 파는 노골적인 광고 피드, 오글거리는 가짜 인스타 감성 전체.",
        ],
      },
    ],
  },
  multiline: true,
  optional: true,
};

export const SURVEY_QUESTIONS: Record<string, SurveyQuestion> = {
  mode: MODE_QUESTION,
  name: NAME_QUESTION,
  why: WHY_QUESTION,
  difference: DIFFERENCE_QUESTION,
  audience: AUDIENCE_QUESTION,
  strength: STRENGTH_QUESTION,
  worst: WORST_QUESTION,
};

export type SurveyAnswer =
  | { id: string; kind: "mode"; value: SurveyMode }
  | { id: string; kind: "text"; value: string };

export type SurveyAnswers = Record<string, SurveyAnswer>;

export function isAnswered(q: SurveyQuestion, a: SurveyAnswer | undefined): boolean {
  if ((q as any).optional) return true;
  if (!a) return false;
  switch (a.kind) {
    case "mode":
      return a.value === "person" || a.value === "brand";
    case "text":
      return a.value.trim().length > 0;
  }
}
