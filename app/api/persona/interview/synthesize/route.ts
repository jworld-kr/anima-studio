import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import type { SurveyAnswer, SurveyAnswers } from "@/app/lib/persona-interview";
import { SURVEY_QUESTIONS } from "@/app/lib/persona-interview";
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

const SYSTEM_PROMPT = `당신은 페르소나 디자이너입니다. 사용자의 객관식 설문 답변을 받아 Anima의 페르소나 빌더 8섹션 JSON을 채웁니다.

중요 원칙:
- 사용자가 고른 옵션과 자유 입력한 텍스트를 최대한 그대로 보존
- 사용자가 직접 입력한 표현/성격이 있으면 그것을 우선
- 만들어내지 말 것: 사용자가 안 말한 사실(이름, 직업, 나이 등) 절대 추가 금지
- 스레드 기본 톤은 반말·구어체임을 전제로 합성 (~했습니다 같은 격식 종결 금지)
- 성격(traits)은 사용자가 직접 고른 것과 자유입력을 그대로 나열. 임의 추가 금지
- 자주 쓰는 표현(expressions)도 사용자가 고르거나 입력한 것이 있으면 그대로 나열하고 임의 추가 금지. 단, 사용자가 표현을 하나도 고르거나 입력하지 않아 비어 있을 때만, 이름·한 줄 소개·타겟·성격·역할을 분석해 이 페르소나가 실제로 자주 쓸 법한 스레드 구어체 말버릇·문구를 4~5개 만들어 채운다 (추상어 금지, 실제 사람이 쓰는 자연스러운 구어체로)
- 추상어("진정성", "고급스러움") 사용 금지. 사용자가 고른 구체적 단어만 사용
- 톤 슬라이더는 사용자 선택을 바탕으로 추론
- 모드가 'person'이면 사람 페르소나, 'brand'면 브랜드 페르소나로 해석

[예시 게시물(examples) 작성 시 한국어 규칙 — 반드시 준수]
- 한 게시물 안에서 종결 톤(반말/존댓말)을 절대 섞지 말 것. 본문을 반말("~했어", "~임")로 시작했으면 마무리·행동 유도까지 끝까지 반말로 ("성수 오면 들러", "토요일까지만 있어"). 본문이 존댓말이면 끝까지 존댓말로.
- 특히 마지막 행동 유도 문장에서 갑자기 "~요/~세요"로 바뀌는 일 금지. 본문과 같은 종결로 통일.
- 고른 표현(expressions)은 문맥에 자연스럽게 맞을 때만 사용. 모든 글에 억지로 끼워넣지 말 것. 안 어울리면 그 글에서는 뺀다.
- 한 문장이나 마무리에 의미가 충돌하는 표현을 겹쳐 쓰지 말 것. 글 전체가 하나의 자연스러운 의미 흐름으로 읽혀야 한다.
- 줄표("—" "–" "ー") 절대 사용 금지. 영어 em dash 흔적이라 한국어 글에 어색함. 호흡은 마침표·쉼표·줄바꿈으로만.
- 일반 하이픈("-")도 문장 안 호흡 끊기 용도로 쓰지 말 것.
- 실제 한국어에서 안 쓰는 작가적 합성어 금지 (예: "연락 한 줄", "마음 한 자락", "시간 한 모금").
- 길이를 채우려 군더더기 묘사·반복·과한 감상 추가 금지. 짧고 정확한 글이 더 좋음.

출력은 아래 스키마를 정확히 따르는 JSON 한 개만. 다른 텍스트·코드펜스·설명 절대 금지.

{
  "basic": {
    "name": "string (사용자가 입력한 이름)",
    "age": number | null,
    "job": "string (사람 모드: oneline에서 추출한 직함. 브랜드 모드: 분야 카테고리)",
    "appearance": "string (선택. 사람이면 인상, 브랜드면 비주얼 인상)",
    "oneline": "string (사용자가 입력한 한 줄 그대로 또는 다듬어서)"
  },
  "personality": {
    "traits": "string (사용자가 고른 성격 옵션 + 자유입력을 쉼표로 연결. 임의 추가 금지)",
    "expressions": ["string", ...] (사용자가 고르거나 입력한 표현을 그대로 배열로. 사용자가 하나도 주지 않아 비어 있으면, 페르소나에 어울리는 자연스러운 스레드 구어체 말버릇·문구를 4~5개 만들어 채운다),
    "speechPattern": "string (콘텐츠 역할 + 성격 답에서 도출. 스레드 반말·구어체 전제. 1~3문장)",
    "forbiddenWords": ["string", ...] (anti 답과 사용자 자유입력에서 추출. 0~5개)
  },
  "world": {
    "background": "string (oneline + vertical 종합. 운영 맥락이나 활동 배경 1~2문장)",
    "interests": ["string", ...] (vertical과 oneline에서 도출, 3~6개),
    "values": "string (anti + role + traits 종합. '~을 위해 ~하지 않는다' 형식 권장, 1~2문장)",
    "dailyRoutine": "string (정보 없으면 빈 문자열로 두기)"
  },
  "contentDirection": {
    "mainTopics": ["string", ...] (vertical·oneline·role을 결합해 이 페르소나가 다룰 주요 주제 4~7개를 구체적으로 도출),
    "sellWhat": "string (브랜드 모드면 oneline에서 추출, 사람 모드면 빈 문자열)",
    "message": "string (role + oneline + values에서 도출. 한 문장)",
    "forbiddenTopics": ["string", ...] (taboo 자유입력 + anti에서 추출)
  },
  "targetAudience": {
    "description": "string (age + gender + vertical 종합. 한 사람을 구체적으로 그리듯 2~3문장)",
    "ageGroup": "string (age 답을 자연스럽게. 예: '30대 초반 직장인')",
    "interests": "string (vertical을 풀어서 한 줄)",
    "toneTip": "string (이 독자에게 통할 톤 한 줄)"
  },
  "tone": {
    "seriousness": 1~10 (traits의 진지함·담담함 정도),
    "professionalism": 1~10 (role이 '든든한 멘토'·'위트 있는 리더'면 높게, '다정한 친구'·'이야기꾼'이면 낮게),
    "formality": 1~10 (스레드는 기본 낮음. expressions에 자조·공감 많으면 더 낮게),
    "depth": 1~10 (traits의 통찰력·본질·분석 계열이 많으면 높게, 가벼운 일상 위주면 낮게)
  },
  "examples": [
    {
      "title": "string (선택)",
      "content": "string (이 페르소나가 쓸 법한 스레드 게시물 2~3개. 사용자가 고른 traits·expressions를 반드시 반영. 스레드 톤(반말·구어체). 분량은 페르소나에 맞춰 짧게 던지거나 길게 풀거나 자유롭게. 줄표 금지)"
    }
  ],
  "forbiddenThings": "string (anti + taboo 종합한 자유 형식 1~2문단)"
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
        typeof tone.formality === "number" ? tone.formality : DEFAULT_TONE.formality,
      depth: typeof tone.depth === "number" ? tone.depth : DEFAULT_TONE.depth,
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

function answerToText(id: string, a: SurveyAnswer | undefined): string {
  if (!a) return "(답변 없음)";
  if (a.kind === "mode") return a.value;
  if (a.kind === "text") return a.value.trim() || "(비워둠)";
  const sel = a.selected.join(", ");
  const cu = a.custom?.trim();
  if (sel && cu) return `${sel} | 직접 입력: ${cu}`;
  if (sel) return sel;
  if (cu) return `직접 입력: ${cu}`;
  return "(선택 없음)";
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

  // Build a structured prompt from the survey schema + user answers.
  const lines: string[] = [];
  for (const [id, q] of Object.entries(SURVEY_QUESTIONS)) {
    const a = answers[id];
    const question =
      q.kind === "mode" ? q.question : (q as any).question ?? id;
    lines.push(`[${id}] ${question}\n→ ${answerToText(id, a)}`);
  }
  const userPrompt = `사용자의 설문 답변:\n\n${lines.join("\n\n")}\n\n위 답변을 바탕으로 페르소나 빌더 JSON을 생성하세요.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3500,
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
