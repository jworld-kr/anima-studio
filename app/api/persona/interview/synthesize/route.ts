import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import type { SurveyAnswers } from "@/app/lib/persona-interview";
import type { WorldBuilding } from "@/app/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getAuthedUser(req: NextRequest) {
  const accessToken = req.headers
    .get("authorization")
    ?.replace(/^Bearer /, "");
  if (!accessToken) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const userClient = createClient(supabaseUrl, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  return user;
}

const SYSTEM_PROMPT = `당신은 스레드(Threads) 전문 브랜드 컨설턴트입니다. 사용자가 제출한 5가지 질문의 서술형 답변을 읽고, 브랜드를 깊이 분석해 Anima 페르소나 빌더 8섹션 JSON을 전문가 수준으로 완성합니다.

## 컨설턴트 원칙

1. 통찰 추출: 사용자의 답변에서 표면적 정보뿐 아니라 숨겨진 강점, 포지션, 철학을 읽어내라. 사용자가 명시하지 않아도 맥락에서 충분히 도출할 수 있다.
2. 사실 추가 금지: 사용자가 언급하지 않은 구체적 수치, 이름, 직업, 사건은 절대 추가하지 말 것.
3. 구체적 언어: 전문가의 시각으로 분석하되, 실제 사람이 쓰는 구체적이고 살아있는 표현으로 번역해 채울 것. "진정성", "고급스러움" 같은 추상어 금지.
4. 스레드 톤 전제: 반말·구어체 기본. "~했습니다" 같은 격식 종결 금지.
5. 모드 해석: mode가 'person'이면 개인 크리에이터/인플루언서, 'brand'이면 브랜드/비즈니스 계정으로 해석.

## 각 답변에서 무엇을 추출할지

- why (왜 시작했어?): 브랜드 창업 신화, 미션, 세계관 → world.background, world.values, contentDirection.message
- difference (뭐가 달라?): 포지션, 차별점, 브랜드 고집 → personality.traits, personality.speechPattern, world.values
- audience (서성거렸으면 하는 사람들): 타겟 독자의 상황·갈망·프로필 → targetAudience 전체
- strength (밑천이 뭐야?): 콘텐츠 전문성, 주요 주제 영역 → contentDirection.mainTopics, world.interests, world.background
- worst (절대 되기 싫은 느낌): 안티패턴, 금기, 브랜드 철학의 역 정의 → forbiddenThings, contentDirection.forbiddenTopics, personality.forbiddenWords

## 표현(expressions) 처리

반드시 전체 답변을 분석해 이 페르소나가 스레드에서 실제로 자주 쓸 법한 구어체 말버릇·문구를 4~5개 만들어 채울 것. 추상어 금지. 자연스러운 한국어 구어체.

## 예시 게시물(examples) 작성 시 한국어 규칙

- 반말/존댓말 절대 혼용 금지. 첫 문장 종결을 끝까지 유지.
- 마지막 행동 유도 문장도 본문과 동일 종결체로 통일.
- 줄표(— – ー) 절대 사용 금지.
- 일반 하이픈(-)도 문장 내 호흡 끊기 목적 금지.
- 실제 한국어에서 안 쓰는 작가적 합성어 금지. (예: "연락 한 줄", "마음 한 자락", "시간 한 모금")
- 길이를 채우려 군더더기 묘사·반복·과한 감상 추가 금지. 짧고 정확한 글이 더 좋음.

출력은 아래 스키마를 정확히 따르는 JSON 한 개만. 다른 텍스트·코드펜스·설명 절대 금지.

{
  "basic": {
    "name": "string (name 답변의 이름. 없으면 fallbackName 사용)",
    "age": null,
    "job": "string (person: why+difference에서 역할/직함 추론. brand: 업종 카테고리)",
    "appearance": "string (선택. 브랜드 인상이나 비주얼 무드 한 줄. 정보 없으면 빈 문자열)",
    "oneline": "string (why + difference 답변을 종합한 브랜드 포지셔닝 한 문장. 구어체로 자연스럽게)"
  },
  "personality": {
    "traits": "string (difference + why + worst 답변에서 도출한 성격 키워드들을 쉼표로 연결. 임의 추가 금지)",
    "expressions": ["string", ...],
    "speechPattern": "string (why + difference + worst를 종합해 도출. 스레드 반말·구어체 전제. 1~3문장)",
    "forbiddenWords": ["string", ...] (worst + difference에서 추출한 피해야 할 표현·톤. 0~5개)
  },
  "world": {
    "background": "string (why + strength 답변을 바탕으로 브랜드가 살아온 맥락·배경. 1~2문장)",
    "interests": ["string", ...] (strength + difference 답변에서 도출한 핵심 관심 영역. 3~6개),
    "values": "string (why + worst + difference 종합. 이 브랜드가 지키는 신념. '~을 위해 ~하지 않는다' 형식 권장. 1~2문장)",
    "dailyRoutine": "string (정보 부족하면 빈 문자열)"
  },
  "contentDirection": {
    "mainTopics": ["string", ...] (strength + difference + why에서 도출한 주요 콘텐츠 주제 4~7개. 구체적으로),
    "sellWhat": "string (brand 모드: strength + why에서 추출. person 모드: 빈 문자열)",
    "message": "string (why + difference + audience 종합한 이 계정의 핵심 메시지. 한 문장)",
    "forbiddenTopics": ["string", ...] (worst + difference에서 추출)
  },
  "targetAudience": {
    "description": "string (audience 답변을 바탕으로 타겟을 생생하게 2~3문장으로 묘사)",
    "ageGroup": "string (audience 답변에서 추론. 자연스러운 표현으로)",
    "interests": "string (audience + strength 답변 기반. 한 줄)",
    "toneTip": "string (이 타겟에게 통할 말투와 접근법. 한 줄)"
  },
  "tone": {
    "seriousness": 1~10,
    "professionalism": 1~10,
    "formality": 1~10,
    "depth": 1~10
  },
  "examples": [
    {
      "title": "string (선택)",
      "content": "string (이 페르소나가 쓸 법한 스레드 게시물 2~3개. personality.traits와 expressions를 반영. 스레드 톤(반말·구어체). 줄표 금지)"
    }
  ],
  "forbiddenThings": "string (worst + difference 종합한 이 브랜드의 절대 금기. 1~2문단)"
}`;

function safeParse(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

const DEFAULT_TONE = {
  seriousness: 5,
  professionalism: 5,
  formality: 3,
  depth: 5,
};

function normalize(raw: any, fallbackName: string): WorldBuilding {
  const basic = raw?.basic ?? {};
  const personality = raw?.personality ?? {};
  const world = raw?.world ?? {};
  const cd = raw?.contentDirection ?? {};
  const ta = raw?.targetAudience ?? {};
  const tone = raw?.tone ?? {};
  const examples = Array.isArray(raw?.examples) ? raw.examples : [];

  return {
    basic: {
      name:
        typeof basic.name === "string" && basic.name.trim()
          ? basic.name.trim()
          : fallbackName,
      age: typeof basic.age === "number" ? basic.age : undefined,
      job: typeof basic.job === "string" ? basic.job : "",
      appearance:
        typeof basic.appearance === "string" ? basic.appearance : undefined,
      oneline: typeof basic.oneline === "string" ? basic.oneline : undefined,
    },
    personality: {
      traits: typeof personality.traits === "string" ? personality.traits : "",
      expressions: Array.isArray(personality.expressions)
        ? personality.expressions.filter((s: any) => typeof s === "string")
        : [],
      speechPattern:
        typeof personality.speechPattern === "string"
          ? personality.speechPattern
          : "",
      forbiddenWords: Array.isArray(personality.forbiddenWords)
        ? personality.forbiddenWords.filter((s: any) => typeof s === "string")
        : [],
    },
    world: {
      background: typeof world.background === "string" ? world.background : "",
      interests: Array.isArray(world.interests)
        ? world.interests.filter((s: any) => typeof s === "string")
        : [],
      values: typeof world.values === "string" ? world.values : "",
      dailyRoutine:
        typeof world.dailyRoutine === "string" ? world.dailyRoutine : "",
    },
    contentDirection: {
      mainTopics: Array.isArray(cd.mainTopics)
        ? cd.mainTopics.filter((s: any) => typeof s === "string")
        : [],
      sellWhat: typeof cd.sellWhat === "string" ? cd.sellWhat : "",
      message: typeof cd.message === "string" ? cd.message : "",
      forbiddenTopics: Array.isArray(cd.forbiddenTopics)
        ? cd.forbiddenTopics.filter((s: any) => typeof s === "string")
        : [],
    },
    targetAudience: {
      description: typeof ta.description === "string" ? ta.description : "",
      ageGroup: typeof ta.ageGroup === "string" ? ta.ageGroup : "",
      interests: typeof ta.interests === "string" ? ta.interests : "",
      toneTip: typeof ta.toneTip === "string" ? ta.toneTip : "",
    },
    tone: {
      seriousness:
        typeof tone.seriousness === "number"
          ? tone.seriousness
          : DEFAULT_TONE.seriousness,
      professionalism:
        typeof tone.professionalism === "number"
          ? tone.professionalism
          : DEFAULT_TONE.professionalism,
      formality:
        typeof tone.formality === "number"
          ? tone.formality
          : DEFAULT_TONE.formality,
      depth:
        typeof tone.depth === "number" ? tone.depth : DEFAULT_TONE.depth,
    },
    examples: examples
      .map((e: any) => ({
        title: typeof e?.title === "string" ? e.title : undefined,
        content: typeof e?.content === "string" ? e.content : "",
      }))
      .filter((e: any) => e.content),
    forbiddenThings:
      typeof raw?.forbiddenThings === "string" ? raw.forbiddenThings : "",
  };
}

function answerText(a: any): string {
  if (!a) return "(답변 없음)";
  if (a.kind === "mode") return a.value === "brand" ? "브랜드/비즈니스" : "개인/크리에이터";
  if (a.kind === "text") return a.value?.trim() || "(비워둠)";
  return "(답변 없음)";
}

const QID_ORDER = ["mode", "name", "why", "difference", "audience", "strength", "worst"] as const;

function resolveLabel(id: string, mode: string): string {
  const isBrand = mode === "brand";
  switch (id) {
    case "mode":       return "모드";
    case "name":       return isBrand ? "브랜드 이름" : "계정 이름";
    case "why":        return isBrand ? "이 브랜드, 왜 시작했어?" : "이 계정, 왜 시작했어?";
    case "difference": return isBrand ? "다른 브랜드들이랑 뭐가 달라?" : "다른 계정들이랑 뭐가 달라?";
    case "audience":   return isBrand ? "서성거렸으면 하는 사람들 (브랜드 주변)" : "서성거렸으면 하는 사람들 (피드)";
    case "strength":   return "제일 자신 있게 털어놓을 수 있는 밑천";
    case "worst":      return isBrand ? "절대 되기 싫은 브랜드 느낌" : "절대 되기 싫은 계정 느낌";
    default:           return id;
  }
}

/**
 * POST /api/persona/interview/synthesize
 * Body: { answers: SurveyAnswers, fallbackName?: string }
 * Returns: { ok: true, worldBuilding, filledKeys }
 */
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const answers: SurveyAnswers | undefined = body?.answers;
  const fallbackName: string = body?.fallbackName ?? "새 페르소나";

  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const mode =
    answers.mode?.kind === "mode" ? answers.mode.value : "person";

  const lines: string[] = [];
  for (const id of QID_ORDER) {
    const a = answers[id];
    const label = resolveLabel(id, mode);
    lines.push(`[${id}] ${label}\n→ ${answerText(a)}`);
  }

  const userPrompt = `사용자 답변:\n\n${lines.join("\n\n")}\n\n위 답변을 바탕으로 브랜드를 전문가 시각으로 진단하고 페르소나 빌더 JSON을 완성하세요.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const part = response.content[0];
    const raw = part?.type === "text" ? part.text : "";
    const parsed = safeParse(raw);

    if (!parsed || typeof parsed !== "object") {
      console.error("synthesize: parse failed. raw=", raw.slice(0, 500));
      return NextResponse.json({ error: "PARSE_FAILED" }, { status: 502 });
    }

    const worldBuilding = normalize(parsed, fallbackName);

    const filledKeys: string[] = [];
    const walk = (obj: any, prefix: string) => {
      if (obj == null) return;
      for (const [k, v] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${k}` : k;
        if (Array.isArray(v)) {
          if (v.length > 0) filledKeys.push(path);
        } else if (typeof v === "object") {
          walk(v, path);
        } else if (typeof v === "string") {
          if (v.trim()) filledKeys.push(path);
        } else if (typeof v === "number") {
          filledKeys.push(path);
        }
      }
    };
    walk(worldBuilding, "");

    return NextResponse.json({ ok: true, worldBuilding, filledKeys });
  } catch (e) {
    console.error("interview/synthesize failed:", e);
    return NextResponse.json({ error: "SYNTHESIZE_FAILED" }, { status: 500 });
  }
}
