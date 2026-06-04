import Anthropic from '@anthropic-ai/sdk';
import { WorldBuilding } from '@/app/types';
import { generateSystemPrompt } from './worldbuilding';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const TOPIC_MODEL = 'claude-opus-4-6';
const CONTENT_MODEL = 'claude-opus-4-6';

export interface ThreadHook {
  title: string;
  label: string;
}

export async function generateThreadHooks(
  worldBuilding: WorldBuilding,
  topic: string,
  existingLabels: string[] = []
): Promise<ThreadHook[]> {
  const systemPrompt = generateSystemPrompt(worldBuilding);

  const labelsHint =
    existingLabels.length > 0
      ? `\n이 페르소나가 이미 사용 중인 라벨: ${existingLabels.join(", ")}\n가능하면 위 라벨 중에서 고르고, 어울리는 게 없을 때만 새 라벨을 만들어주세요.`
      : "";

  const userPrompt = `사용자가 제시한 주제로 Thread 게시물 주제 10개를 생성해주세요.

주제: "${topic}"

각 주제마다 *짧은 분류 라벨* 하나를 함께 정해주세요.
라벨은 2~6글자의 자연스러운 한국어로, 주제를 보관할 폴더 이름처럼 만들어주세요. (예: "일상 관찰", "메뉴", "회고", "운영", "손님", "시작")
${labelsHint}

다음 JSON 형식으로 정확히 출력해주세요. 코드 펜스나 다른 설명 없이 JSON 배열만:

[
  { "title": "첫번째 주제", "label": "라벨" },
  { "title": "두번째 주제", "label": "라벨" },
  ... 10개
]

각 주제는 구체적이고 흥미로운 Thread 주제여야 합니다.`;

  const response = await client.messages.create({
    model: TOPIC_MODEL,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt },
    ],
  });

  const part = response.content[0];
  const rawText = part?.type === 'text' ? part.text : '';

  // Parse JSON array, tolerating code fences and surrounding noise.
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('Failed to parse hooks JSON');
    parsed = JSON.parse(match[0]);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Hooks response was not an array');
  }

  return parsed
    .map((item: any) => ({
      title:
        typeof item?.title === 'string' && item.title.trim()
          ? item.title.trim()
          : '',
      label:
        typeof item?.label === 'string' && item.label.trim()
          ? item.label.trim()
          : '기타',
    }))
    .filter((h) => h.title)
    .slice(0, 10);
}

export interface GenerateThreadPostsOptions {
  /** Structural hint, e.g. "1번 시작, 2번 전개, 3번 마무리". */
  shape?: string;
  /** Purpose / nuance brief, e.g. "공감 — 함께 있다는 신호 우선". */
  purposeBrief?: string;
  /** Per-post character range. Both must be set together. */
  minChars?: number;
  maxChars?: number;
}

export async function generateThreadPosts(
  worldBuilding: WorldBuilding,
  topic: string,
  selectedHook: string,
  length: number,
  options: GenerateThreadPostsOptions = {}
): Promise<Array<{ order: number; content: string }>> {
  const systemPrompt = generateSystemPrompt(worldBuilding);

  const shapeBlock = options.shape
    ? `- 구조적 가이드라인: ${options.shape}\n`
    : "";
  const purposeBlock = options.purposeBrief
    ? `- 콘텐츠의 발행 목적과 정서적 뉘앙스: ${options.purposeBrief}\n`
    : "";

  // Length range. LLMs can't count characters reliably (they think in
  // tokens), so we pair the char range with a visual/structural cue.
  const hasRange =
    typeof options.minChars === "number" &&
    typeof options.maxChars === "number";
  const min = hasRange ? options.minChars : 150;
  const max = hasRange ? options.maxChars : 280;
  const lengthBlock = `- 분량 제약: 각 게시물은 공백 포함 약 ${min}자 이상 ${max}자 이하. (모바일 화면 기준 약 4~6줄 내외의 압축된 호흡)\n`;

  // JSON array output — no fragile "===" delimiter. Eliminates the risk
  // of the model dropping/altering a separator and losing all posts.
  const userPrompt = `선택된 주제와 오프닝 문장을 활용하여, 서로 유기적으로 연결되는 ${length}개의 스레드(Threads) 연작 게시물을 작성해주세요.

[기획 콘셉트]
- 선택된 주제: "${topic}"
- 시작 오프닝(후킹): "${selectedHook}"
${purposeBlock}${shapeBlock}${lengthBlock}
[작성 원칙]
1. 최상단 System 지시어에 정의된 [자연스러운 한국어 규칙]과 [스레드 글쓰기 기본 규칙]을 절대적으로 준수하세요. (번역체·줄표 사용 절대 금지, 반말 구어체 유지)
2. 각 게시물은 단독으로도 완성된 글이면서, 전체가 하나의 타래(Thread)로 매끄럽게 이어져야 합니다.
3. 줄바꿈을 적극 활용해 호흡을 끊어주세요.

[출력 형식]
반드시 아래 JSON 배열 포맷으로만 답변하세요. 마크다운 코드 펜스(\`\`\`)나 다른 부연 설명은 절대 금지합니다.

[
  { "order": 1, "content": "첫 번째 스레드 본문 (시작 오프닝을 자연스럽게 녹여서)" },
  { "order": 2, "content": "두 번째 스레드 본문" }
]`;

  const response = await client.messages.create({
    model: CONTENT_MODEL,
    max_tokens: 2500,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt },
    ],
  });

  const part = response.content[0];
  const rawText = part?.type === 'text' ? part.text : '';

  // Parse JSON array, tolerating code fences and surrounding noise.
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error('No JSON array parsed from response:', rawText);
      throw new Error('Failed to parse posts from response');
    }
    parsed = JSON.parse(match[0]);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Posts response was not an array');
  }

  const posts = parsed
    .map((item: any, idx: number) => ({
      order: typeof item?.order === 'number' ? item.order : idx + 1,
      content: typeof item?.content === 'string' ? item.content.trim() : '',
    }))
    .filter((p) => p.content)
    .slice(0, length);

  if (posts.length === 0) {
    console.error('No posts parsed from response:', rawText);
    throw new Error('Failed to parse posts from response');
  }

  return posts;
}
