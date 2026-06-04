"use client";

import {
  Channel,
  IdeaItem,
  ThreadContent,
} from "@/app/types";
import {
  contentStorage,
  generateId,
  ideaStorage,
} from "@/app/lib/supabase-storage";
import { personaColor } from "@/app/lib/personaColor";
import { groupByRelativeDate } from "@/app/lib/dateGroup";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Trash2,
  Pencil,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Save,
  Send,
  FileText,
  Inbox,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Tabs } from "../../ui/Tabs";
import { Badge } from "../../ui/Badge";
import { Label, Textarea } from "../../ui/Input";
import { EmptyState } from "../../ui/EmptyState";
import { Skeleton } from "../../ui/Skeleton";
import { useToast } from "../../ui/Toast";
import { PublishPanel } from "./PublishPanel";
import { TopicConsulting } from "./TopicConsulting";
import { LabelPicker } from "./LabelPicker";
import { useInk } from "../InkContext";
import { supabase } from "@/app/lib/supabase";
import { INK_COSTS } from "@/app/lib/ink";
import { InkCost } from "../InkCost";
import { getCurrentPlan, HISTORY_RETENTION_DAYS } from "@/app/lib/plan-client";
import type { PlanId } from "@/app/lib/billing";

type SubTab = "generate" | "manage" | "queue" | "history";
type GenerateStep = "input" | "review";

interface Props {
  channel: Channel;
}

/**
 * Content count → content shape mapping.
 * Only structural — length is controlled separately by LENGTH_PRESETS.
 */
const COUNT_SHAPES: Record<
  1 | 2 | 3 | 4 | 5,
  { label: string; desc: string; shape: string }
> = {
  1: {
    label: "단편",
    desc: "한 호흡으로 끝나는 단단한 한 편",
    shape: "한 편 안에 완결된 인사이트나 장면. 군더더기 없이.",
  },
  2: {
    label: "단편 + 부연",
    desc: "메인 한 편과 짧은 보충",
    shape: "1번에서 본론, 2번에서 보충하거나 다른 각도.",
  },
  3: {
    label: "스레드",
    desc: "시작·전개·마무리 3박자",
    shape: "1번 시작(상황·후킹), 2번 전개(중심 이야기), 3번 마무리(인사이트·반응 유도).",
  },
  4: {
    label: "확장 스레드",
    desc: "시작·전개·심화·마무리",
    shape: "1번 시작, 2번 전개, 3번 심화·반전, 4번 마무리.",
  },
  5: {
    label: "긴 호흡 / 연재형",
    desc: "한 주제를 여러 각도로 풀어가는 연재",
    shape: "한 주제를 5개 포스트로 다각도 전개. 각 포스트가 독립적이면서도 연결됨.",
  },
};

/**
 * Per-post character length presets. The min/max range is passed to
 * Claude as a hard constraint so output length is consistent.
 */
type LengthKey = "short" | "standard" | "long";

const LENGTH_PRESETS: Record<
  LengthKey,
  { label: string; desc: string; min: number; max: number; midpoint: number }
> = {
  short: {
    label: "짧게",
    desc: "한 줄로 단단하게 끊는 분량",
    min: 40,
    max: 90,
    midpoint: 70,
  },
  standard: {
    label: "표준",
    desc: "스레드에 가장 잘 어울리는 분량",
    min: 80,
    max: 150,
    midpoint: 120,
  },
  long: {
    label: "길게",
    desc: "맥락을 충분히 담는 분량",
    min: 150,
    max: 280,
    midpoint: 220,
  },
};

type PurposeKey = "empathy" | "insight" | "trust" | "action";

/**
 * Each purpose maps to a *reader reaction* — a marketing-grade KPI.
 * The user picks "what reaction do you want to drive?" instead of
 * fuzzy content categories. This keeps the four options on the same
 * axis (audience reaction), so there's no overlap or confusion.
 */
const PURPOSES: Record<
  PurposeKey,
  { label: string; desc: string; brief: string; reactionEnding: string }
> = {
  empathy: {
    label: "공감",
    desc: "\"나도 그래\" 반응 유도",
    brief:
      "보편적 감정·일상 장면 중심. 결론·교훈 없이 '함께 있다는 신호'를 우선. 일기체나 대화체로 풀어도 좋음.",
    reactionEnding:
      "댓글·DM 유도형 마무리. 페르소나가 평소 쓰는 반말·구어체 그대로. '다들 그런 적 있지 않아?', '나만 이래?', '비슷한 경험 있으면 알려줘' 같은 자연스러운 질문 한 줄로 닫기. 갑자기 격식체로 바뀌면 절대 안 됨.",
  },
  insight: {
    label: "발견",
    desc: "\"이런 생각 처음 해봤네\" 반응 유도",
    brief:
      "사건이나 관찰에서 한 줄짜리 통찰 끌어내기. 저장·공유 반응을 노리는 글.",
    reactionEnding:
      "짧은 단정형 한 줄로 통찰을 박은 뒤, 페르소나 톤 그대로 '너는 어떻게 생각해?', '이거 동의돼?' 같은 자연스러운 호명 한 줄을 덧붙여 댓글 유도. 갑자기 존댓말로 바뀌지 말 것.",
  },
  trust: {
    label: "신뢰",
    desc: "\"이 사람 잘 안다\" 반응 유도",
    brief:
      "구체적인 사실·노하우·디테일 중심. 군더더기 빼고 정보 밀도 높게. 가르치는 톤은 피하되 명확하게.",
    reactionEnding:
      "마지막은 페르소나 톤으로 정보 교류 유도. '궁금한 거 있으면 댓글로', '비슷한 사례 있으면 들려줘', '경험 있는 사람 손' 같은 자연스러운 한 줄. 본문 톤과 같은 반말·구어체를 유지할 것.",
  },
  action: {
    label: "행동",
    desc: "\"한번 가볼까\" 반응 유도",
    brief:
      "구체적 대상(메뉴·제품·서비스 등)을 '왜' 추천하는지 진솔하게. 클릭·방문·구매 반응을 노리는 글.",
    reactionEnding:
      "마지막은 명확한 행동 유도 한 줄. '한번 가봐', '저장해뒀다가 시간 날 때 봐봐', '댓글로 알려줘' 같이 페르소나 톤 그대로. 갑자기 '~해 주세요'로 바뀌지 말 것.",
  },
};

export function ThreadWorkspace({ channel }: Props) {
  const { toast } = useToast();
  const { refresh: refreshInk, promptTopup, balance: inkBalance } = useInk();
  const accent = personaColor(channel.id);

  const inkTotal = inkBalance?.total ?? 0;
  const topicCost = INK_COSTS.topic_generation;
  const contentCost = INK_COSTS.content_generation;
  const regenCost = INK_COSTS.content_regeneration;

  /**
   * Helper: call an authenticated thread API route. Handles auth header,
   * insufficient-ink (HTTP 402) → show topup modal, returns parsed json
   * or throws.
   */
  const callThreadApi = async (
    url: string,
    body: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("로그인이 만료되었습니다.");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 402 && data?.error === "INSUFFICIENT_INK") {
      promptTopup(data.required ?? 0);
      throw new Error("INSUFFICIENT_INK");
    }
    if (!res.ok) {
      throw new Error(data?.error || "Request failed");
    }
    // Sync local ink state if the response carries balance info.
    if (data?.ink && typeof data.ink === "object") {
      const ink = data.ink as {
        subscription?: number;
        topup?: number;
        total?: number;
      };
      if (
        typeof ink.subscription === "number" &&
        typeof ink.topup === "number" &&
        typeof ink.total === "number"
      ) {
        // Fire-and-forget refresh to keep sidebar pill in sync.
        void refreshInk();
      }
    }
    return data;
  };

  /* ---------------- state ---------------- */

  const [subTab, setSubTab] = useState<SubTab>("generate");

  // generate
  const [generateStep, setGenerateStep] = useState<GenerateStep>("input");
  // Each generated topic has its own Claude-inferred label that the
  // user can edit inline before saving.
  const [generatedLabels, setGeneratedLabels] = useState<Record<number, string>>(
    {}
  );
  const [ideaPrompt, setIdeaPrompt] = useState("");
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<number>>(new Set());
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  // manage
  const [topics, setTopics] = useState<IdeaItem[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // queue
  const [selectedTopic, setSelectedTopic] = useState<IdeaItem | null>(null);
  const [contentCount, setContentCount] = useState(3);
  const [postLength, setPostLength] = useState<LengthKey>("standard");
  const [purpose, setPurpose] = useState<PurposeKey>("empathy");
  const [inviteReaction, setInviteReaction] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<
    Array<{ order: number; content: string }>
  >([]);
  const [editingPostIdx, setEditingPostIdx] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // history
  const [contents, setContents] = useState<ThreadContent[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState(true);
  const [expandedContentId, setExpandedContentId] = useState<string | null>(
    null
  );

  // publish
  const [publishingContent, setPublishingContent] =
    useState<ThreadContent | null>(null);

  // plan (for history retention)
  const [plan, setPlan] = useState<PlanId>("free");

  /* ---------------- effects ---------------- */

  useEffect(() => {
    let cancelled = false;
    getCurrentPlan().then((p) => {
      if (!cancelled) setPlan(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const loadTopics = async () => {
      setIsLoadingTopics(true);
      try {
        const loaded = await ideaStorage.getIdeas(channel.id);
        setTopics(loaded);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    loadTopics();
  }, [channel.id]);

  useEffect(() => {
    const loadContents = async () => {
      setIsLoadingContents(true);
      try {
        const draft = await contentStorage.getContentsByStatus(
          channel.id,
          "draft"
        );
        const published = await contentStorage.getContentsByStatus(
          channel.id,
          "published"
        );
        setContents([...draft, ...published]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingContents(false);
      }
    };
    loadContents();
  }, [channel.id]);

  /* ---------------- derived ---------------- */

  // History retention: free plan only keeps published content for N days.
  // Drafts are always kept; only published items past the cutoff are hidden.
  const retentionDays = HISTORY_RETENTION_DAYS[plan];
  const visibleContents = useMemo(() => {
    if (retentionDays == null) return contents;
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    return contents.filter((c) => {
      if (c.status !== "published") return true;
      const ts = new Date(c.publishedAt || c.createdAt).getTime();
      return Number.isNaN(ts) ? true : ts >= cutoff;
    });
  }, [contents, retentionDays]);

  const draftCount = visibleContents.filter((c) => c.status === "draft").length;
  const publishedCount = visibleContents.filter(
    (c) => c.status === "published"
  ).length;

  const tabItems = useMemo(
    () => [
      { id: "generate" as const, label: "주제 생성" },
      { id: "manage" as const, label: "주제 관리", count: topics.length },
      { id: "queue" as const, label: "콘텐츠 작업" },
      {
        id: "history" as const,
        label: "히스토리",
        count: visibleContents.length || undefined,
      },
    ],
    [topics.length, visibleContents.length]
  );

  /* ---------------- handlers ---------------- */

  const handleGenerateIdeas = async () => {
    if (!ideaPrompt.trim()) {
      toast({ description: "주제를 입력해주세요.", variant: "danger" });
      return;
    }
    setIsGeneratingIdeas(true);
    try {
      // Send the user's raw input as the topic; Claude already has
      // persona context via worldBuilding.
      const existingLabels = Array.from(
        new Set(topics.map((t) => t.category).filter(Boolean))
      );
      const data = (await callThreadApi("/api/thread/hooks", {
        worldBuilding: channel.worldBuilding,
        topic: ideaPrompt.trim(),
        existingLabels,
      })) as { hooks: Array<{ title: string; label: string }> };

      const titles: string[] = [];
      const labels: Record<number, string> = {};
      data.hooks.slice(0, 10).forEach((h, i) => {
        titles.push(h.title);
        labels[i] = h.label || "기타";
      });
      setGeneratedIdeas(titles);
      setGeneratedLabels(labels);
      setGenerateStep("review");
    } catch (e) {
      if ((e as Error).message === "INSUFFICIENT_INK") {
        // Modal already shown by callThreadApi; no extra toast needed.
        return;
      }
      console.error(e);
      toast({
        description: "주제 생성에 실패했습니다.",
        variant: "danger",
      });
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleSaveIdeas = async () => {
    if (selectedIdeas.size === 0) {
      toast({ description: "최소 하나의 주제를 선택하세요.", variant: "danger" });
      return;
    }
    try {
      const picked = Array.from(selectedIdeas)
        .map((i) => ({
          idx: i,
          title: generatedIdeas[i],
          label: (generatedLabels[i] ?? "기타").trim() || "기타",
        }))
        .filter((p) => !!p.title);
      for (const p of picked) {
        await ideaStorage.addIdea({
          id: generateId("idea"),
          channelId: channel.id,
          title: p.title,
          category: p.label,
          createdAt: new Date().toISOString(),
        });
      }
      const loaded = await ideaStorage.getIdeas(channel.id);
      setTopics(loaded);
      setGeneratedIdeas([]);
      setSelectedIdeas(new Set());
      setIdeaPrompt("");
      setGenerateStep("input");
      setSubTab("manage");
      toast({
        title: "저장 완료",
        description: `${picked.length}개의 주제를 저장했습니다.`,
        variant: "success",
      });
    } catch (e) {
      console.error(e);
      toast({ description: "저장에 실패했습니다.", variant: "danger" });
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await ideaStorage.deleteIdea(id);
      const loaded = await ideaStorage.getIdeas(channel.id);
      setTopics(loaded);
      toast({ description: "주제를 삭제했습니다.", variant: "default" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateContent = async () => {
    if (!selectedTopic) return;
    // If we already have generated posts for this topic in the session,
    // treat the next call as a regeneration (50% off ink).
    const isRegenerate = generatedPosts.length > 0;
    setIsGenerating(true);
    try {
      const shape =
        COUNT_SHAPES[contentCount as 1 | 2 | 3 | 4 | 5]?.shape ?? "";
      const purposeDef = PURPOSES[purpose];
      const purposeBrief = inviteReaction
        ? `${purposeDef.brief}\n\n[마무리 규칙]\n${purposeDef.reactionEnding}`
        : `${purposeDef.brief}\n\n[마무리 규칙]\n반응 유도 없이 페르소나 톤 그대로 단정형 한 줄로 닫기. 질문이나 독자를 부르는 호칭으로 끝내지 말 것.`;
      const lengthPreset = LENGTH_PRESETS[postLength];
      const data = (await callThreadApi("/api/thread/posts", {
        worldBuilding: channel.worldBuilding,
        topic: selectedTopic.title,
        selectedHook: selectedTopic.title,
        length: contentCount,
        regenerate: isRegenerate,
        shape,
        purposeBrief,
        minChars: lengthPreset.min,
        maxChars: lengthPreset.max,
      })) as { posts: Array<{ order: number; content: string }> };
      if (!data.posts || data.posts.length === 0) {
        throw new Error("빈 응답을 받았습니다.");
      }
      setGeneratedPosts(data.posts);
    } catch (e) {
      if ((e as Error).message === "INSUFFICIENT_INK") return;
      const message =
        e instanceof Error ? e.message : "생성에 실패했습니다.";
      console.error(e);
      toast({
        description: message,
        variant: "danger",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePost = (idx: number) => {
    if (!editingContent.trim()) return;
    const updated = [...generatedPosts];
    updated[idx].content = editingContent;
    setGeneratedPosts(updated);
    setEditingPostIdx(null);
  };

  const persistContent = async (status: "draft" | "published") => {
    if (!selectedTopic || generatedPosts.length === 0) return;
    try {
      const content: ThreadContent = {
        id: generateId("content"),
        channelId: channel.id,
        type: "thread",
        status,
        ideaId: selectedTopic.id,
        category: selectedTopic.category,
        input: {
          topic: selectedTopic.title,
          referenceUrl: "",
          hookStyle: "",
          length: contentCount,
        },
        output: { hook: selectedTopic.title, posts: generatedPosts },
        publishedAt: status === "published" ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
      };
      await contentStorage.addContent(content);
      const draft = await contentStorage.getContentsByStatus(
        channel.id,
        "draft"
      );
      const published = await contentStorage.getContentsByStatus(
        channel.id,
        "published"
      );
      setContents([...draft, ...published]);
      toast({
        title: status === "published" ? "발행되었습니다" : "저장되었습니다",
        description: status === "published" ? "히스토리에서 확인하세요." : "초안에 보관되었습니다.",
        variant: "success",
      });
      setGeneratedPosts([]);
      setSelectedTopic(null);
      setEditingPostIdx(null);
      if (status === "published") setSubTab("history");
    } catch (e) {
      console.error(e);
      toast({ description: "저장에 실패했습니다.", variant: "danger" });
    }
  };

  /**
   * Save the current draft and immediately open the publish panel for it.
   * The content stays as `draft` until the user confirms publication
   * inside the panel.
   */
  const startPublishFromQueue = async () => {
    if (!selectedTopic || generatedPosts.length === 0) return;
    try {
      const content: ThreadContent = {
        id: generateId("content"),
        channelId: channel.id,
        type: "thread",
        status: "draft",
        ideaId: selectedTopic.id,
        category: selectedTopic.category,
        input: {
          topic: selectedTopic.title,
          referenceUrl: "",
          hookStyle: "",
          length: contentCount,
        },
        output: { hook: selectedTopic.title, posts: generatedPosts },
        createdAt: new Date().toISOString(),
      };
      await contentStorage.addContent(content);
      const draft = await contentStorage.getContentsByStatus(
        channel.id,
        "draft"
      );
      const published = await contentStorage.getContentsByStatus(
        channel.id,
        "published"
      );
      setContents([...draft, ...published]);
      setPublishingContent(content);
      setGeneratedPosts([]);
      setSelectedTopic(null);
      setEditingPostIdx(null);
    } catch (e) {
      console.error(e);
      toast({
        description: "발행을 시작할 수 없습니다.",
        variant: "danger",
      });
    }
  };

  /**
   * Mark a content as published. Called from inside the PublishPanel.
   */
  const confirmPublished = async (id: string) => {
    try {
      await contentStorage.updateContent(id, {
        status: "published",
        publishedAt: new Date().toISOString(),
      });
      const draft = await contentStorage.getContentsByStatus(
        channel.id,
        "draft"
      );
      const published = await contentStorage.getContentsByStatus(
        channel.id,
        "published"
      );
      setContents([...draft, ...published]);
      setPublishingContent(null);
      setSubTab("history");
      toast({
        title: "발행 완료로 기록했습니다",
        description: "히스토리에서 확인할 수 있습니다.",
        variant: "success",
      });
    } catch (e) {
      console.error(e);
      toast({
        description: "발행 기록에 실패했습니다.",
        variant: "danger",
      });
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await contentStorage.deleteContent(id);
      const draft = await contentStorage.getContentsByStatus(
        channel.id,
        "draft"
      );
      const published = await contentStorage.getContentsByStatus(
        channel.id,
        "published"
      );
      setContents([...draft, ...published]);
      toast({
        description: "콘텐츠를 삭제했습니다.",
        variant: "default",
      });
    } catch (e) {
      console.error(e);
      toast({
        description: "삭제에 실패했습니다.",
        variant: "danger",
      });
    }
  };

  /* ---------------- render ---------------- */

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <PageHeader channel={channel} accent={accent} />

      {/* Sub-tabs */}
      <div className="px-6 lg:px-10">
        <Tabs<SubTab>
          items={tabItems}
          active={subTab}
          onChange={(id) => setSubTab(id)}
        />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
        {subTab === "generate" && (
          <GenerateSection
            step={generateStep}
            ideaPrompt={ideaPrompt}
            setIdeaPrompt={setIdeaPrompt}
            generatedIdeas={generatedIdeas}
            generatedLabels={generatedLabels}
            setGeneratedLabels={setGeneratedLabels}
            existingLabels={Array.from(
              new Set(topics.map((t) => t.category).filter(Boolean))
            )}
            selectedIdeas={selectedIdeas}
            setSelectedIdeas={setSelectedIdeas}
            onGenerate={handleGenerateIdeas}
            onSave={handleSaveIdeas}
            onBack={() => {
              setGenerateStep("input");
              setGeneratedIdeas([]);
              setSelectedIdeas(new Set());
              setGeneratedLabels({});
            }}
            isGenerating={isGeneratingIdeas}
            inkCost={topicCost}
            inkBalance={inkTotal}
          />
        )}

        {subTab === "manage" && (
          <ManageSection
            topics={topics}
            isLoading={isLoadingTopics}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onPick={(t) => {
              setSelectedTopic(t);
              setGeneratedPosts([]);
              setSubTab("queue");
            }}
            onDelete={handleDeleteIdea}
            onCreate={() => setSubTab("generate")}
          />
        )}

        {subTab === "queue" && (
          <QueueSection
            topic={selectedTopic}
            contentCount={contentCount}
            setContentCount={setContentCount}
            postLength={postLength}
            setPostLength={setPostLength}
            purpose={purpose}
            setPurpose={setPurpose}
            inviteReaction={inviteReaction}
            setInviteReaction={setInviteReaction}
            isGenerating={isGenerating}
            generatedPosts={generatedPosts}
            editingIdx={editingPostIdx}
            editingContent={editingContent}
            setEditingIdx={setEditingPostIdx}
            setEditingContent={setEditingContent}
            onSavePost={handleSavePost}
            onDeletePost={(idx) =>
              setGeneratedPosts(generatedPosts.filter((_, i) => i !== idx))
            }
            onGenerate={handleGenerateContent}
            onPickTopic={() => setSubTab("manage")}
            onCancel={() => {
              setSelectedTopic(null);
              setGeneratedPosts([]);
            }}
            onSaveDraft={() => persistContent("draft")}
            onPublish={startPublishFromQueue}
            accent={accent}
            inkBalance={inkTotal}
            contentCost={contentCost}
            regenCost={regenCost}
          />
        )}

        {subTab === "history" && (
          <HistorySection
            contents={visibleContents}
            isLoading={isLoadingContents}
            draftCount={draftCount}
            publishedCount={publishedCount}
            retentionDays={retentionDays}
            expandedId={expandedContentId}
            setExpandedId={setExpandedContentId}
            onPublish={(content) => setPublishingContent(content)}
            onDelete={deleteContent}
          />
        )}
      </div>

      {publishingContent && (
        <PublishPanel
          content={publishingContent}
          personaName={channel.name}
          onClose={() => setPublishingContent(null)}
          onMarkPublished={() => confirmPublished(publishingContent.id)}
        />
      )}
    </div>
  );
}

/* ============================================================
   Page header
   ============================================================ */

function PageHeader({ channel, accent }: { channel: Channel; accent: string }) {
  return (
    <header className="px-6 lg:px-10 pt-8 pb-6 border-b border-ink-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-display text-ink-50 shrink-0"
            style={{ background: accent }}
            aria-hidden
          >
            {channel.name[0] || "·"}
          </span>
          <div className="min-w-0">
            <p className="text-eyebrow text-ink-400 mb-1">Persona Workspace</p>
            <h1 className="font-display text-[28px] lg:text-[32px] text-ink-800 tracking-[-0.025em] truncate">
              {channel.name || "이름 없는 페르소나"}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   Generate
   ============================================================ */

function GenerateSection(props: {
  step: GenerateStep;
  ideaPrompt: string;
  setIdeaPrompt: (v: string) => void;
  generatedIdeas: string[];
  generatedLabels: Record<number, string>;
  setGeneratedLabels: (
    next:
      | Record<number, string>
      | ((prev: Record<number, string>) => Record<number, string>)
  ) => void;
  existingLabels: string[];
  selectedIdeas: Set<number>;
  setSelectedIdeas: (s: Set<number>) => void;
  onGenerate: () => void;
  onSave: () => void;
  onBack: () => void;
  isGenerating: boolean;
  inkCost: number;
  inkBalance: number;
}) {
  const {
    step,
    ideaPrompt,
    setIdeaPrompt,
    generatedIdeas,
    generatedLabels,
    setGeneratedLabels,
    existingLabels,
    selectedIdeas,
    setSelectedIdeas,
    onGenerate,
    onSave,
    onBack,
    isGenerating,
    inkCost,
    inkBalance,
  } = props;
  const insufficient = inkBalance < inkCost;

  if (step === "review") {
    return (
      <div className="max-w-[760px] mx-auto animate-fade-in">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-ink-500 hover:text-ink-800 transition-colors mb-5"
        >
          <ArrowLeft size={13} strokeWidth={1.75} />
          다시 입력
        </button>

        <div className="mb-6">
          <p className="text-eyebrow text-ink-400 mb-2">Step 02</p>
          <h2 className="font-display text-[26px] text-ink-800 tracking-[-0.02em] mb-2">
            마음에 드는 주제를 골라주세요.
          </h2>
          <p className="text-[14px] text-ink-500">
            {generatedIdeas.length}개 생성됨 · {selectedIdeas.size}개 선택됨
          </p>
        </div>

        <Card className="divide-y divide-ink-200">
          {generatedIdeas.map((idea, idx) => {
            const checked = selectedIdeas.has(idx);
            const label = generatedLabels[idx] ?? "기타";
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                  checked ? "bg-anima-50/40" : "hover:bg-ink-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = new Set(selectedIdeas);
                    if (e.target.checked) next.add(idx);
                    else next.delete(idx);
                    setSelectedIdeas(next);
                  }}
                  className="mt-1 accent-ink-800 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-ink-700 leading-[1.6]">
                    {idea}
                  </p>
                  <LabelPicker
                    label={label}
                    existingLabels={existingLabels}
                    onChange={(next: string) =>
                      setGeneratedLabels((prev) => ({
                        ...prev,
                        [idx]: next,
                      }))
                    }
                  />
                </div>
              </div>
            );
          })}
        </Card>

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button variant="secondary" onClick={onBack}>
            다시 생성
          </Button>
          <Button variant="primary" onClick={onSave}>
            {selectedIdeas.size > 0
              ? `${selectedIdeas.size}개 저장`
              : "주제 저장"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto animate-fade-in">
      <div className="mb-8">
        <p className="text-eyebrow text-ink-400 mb-3">Step 01</p>
        <h2 className="font-display text-[22px] sm:text-[26px] text-ink-800 tracking-[-0.015em] leading-[1.45] mb-4 break-keep">
          <span className="block">멋진 카피는 Anima가 만듭니다.</span>
          <span className="block mt-2.5">
            당신은 오늘 있었던
            <br className="sm:hidden" /> 사소한 단어만 툭 던져주세요!
          </span>
        </h2>
        <div className="text-[13.5px] sm:text-[14px] text-ink-500 leading-[1.8] break-keep space-y-1.5">
          <p>
            거창한 주제보다{" "}
            <span className="font-medium text-ink-700">
              '우리만의 진짜 이야기'
            </span>
            를 넣을 때 가장 반응이 좋아요.
          </p>
          <p>문장을 완성할 필요 없이, 카톡 보내듯 키워드만 적어보세요.</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Prompt */}
        <div>
          <Textarea
            value={ideaPrompt}
            onChange={(e) => setIdeaPrompt(e.target.value)}
            placeholder="완벽한 문장이 아니어도 괜찮아요. 단어 몇 개만 가볍게 적어보세요."
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <TopicConsulting />
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onGenerate}
            disabled={isGenerating || insufficient}
            leadingIcon={<Sparkles size={15} strokeWidth={1.75} />}
            trailingIcon={
              <InkCost cost={inkCost} insufficient={insufficient} onDark />
            }
          >
            {isGenerating
              ? "주제 생성 중…"
              : insufficient
              ? "잉크 부족 — 충전 필요"
              : "10개 주제 생성"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Manage
   ============================================================ */

function ManageSection(props: {
  topics: IdeaItem[];
  isLoading: boolean;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  onPick: (t: IdeaItem) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}) {
  const {
    topics,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    onPick,
    onDelete,
    onCreate,
  } = props;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[68px]" />
        ))}
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={20} strokeWidth={1.5} />}
        title="아직 저장된 주제가 없습니다"
        description="페르소나의 말투로 주제 후보를 먼저 생성해 보세요."
        action={
          <Button
            variant="primary"
            onClick={onCreate}
            leadingIcon={<Sparkles size={14} strokeWidth={1.75} />}
          >
            주제 생성하기
          </Button>
        }
      />
    );
  }

  const categories = Object.entries(
    topics.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {})
  ).sort();

  const filtered = topics.filter(
    (t) => categoryFilter === "all" || t.category === categoryFilter
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 lg:gap-8 animate-fade-in">
      {/* Filter */}
      <aside className="lg:sticky lg:top-2 self-start">
        <p className="text-[10px] text-ink-400 tracking-[0.12em] uppercase font-medium mb-3 px-1">
          카테고리
        </p>
        <div className="space-y-0.5">
          <FilterButton
            active={categoryFilter === "all"}
            label="전체"
            count={topics.length}
            onClick={() => setCategoryFilter("all")}
          />
          {categories.map(([cat, count]) => (
            <FilterButton
              key={cat}
              active={categoryFilter === cat}
              label={cat}
              count={count}
              onClick={() => setCategoryFilter(cat)}
            />
          ))}
        </div>
      </aside>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((topic) => (
          <Card
            key={topic.id}
            className="group flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5"
          >
            <span className="hidden sm:block w-1 self-stretch rounded-full bg-anima-200 group-hover:bg-anima-400 transition-colors" />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-ink-800 leading-[1.55] mb-1 break-keep">
                {topic.title}
              </p>
              <Badge variant="muted">{topic.category}</Badge>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onDelete(topic.id)}
                leadingIcon={<Trash2 size={12} strokeWidth={1.75} />}
              >
                삭제
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onPick(topic)}
                trailingIcon={<ChevronRight size={12} strokeWidth={1.75} />}
              >
                작업하기
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] transition-colors ${
        active
          ? "bg-ink-100 text-ink-800 font-medium"
          : "text-ink-500 hover:bg-ink-50 hover:text-ink-700"
      }`}
    >
      <span className="truncate text-left">{label}</span>
      <span className="font-mono text-[10.5px] tabular-nums text-ink-400 ml-2">
        {count}
      </span>
    </button>
  );
}

/* ============================================================
   Queue
   ============================================================ */

function QueueSection(props: {
  topic: IdeaItem | null;
  contentCount: number;
  setContentCount: (n: number) => void;
  postLength: LengthKey;
  setPostLength: (v: LengthKey) => void;
  purpose: PurposeKey;
  setPurpose: (v: PurposeKey) => void;
  inviteReaction: boolean;
  setInviteReaction: (v: boolean) => void;
  isGenerating: boolean;
  generatedPosts: Array<{ order: number; content: string }>;
  editingIdx: number | null;
  editingContent: string;
  setEditingIdx: (n: number | null) => void;
  setEditingContent: (s: string) => void;
  onSavePost: (idx: number) => void;
  onDeletePost: (idx: number) => void;
  onGenerate: () => void;
  onPickTopic: () => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  accent: string;
  inkBalance: number;
  contentCost: number;
  regenCost: number;
}) {
  const {
    topic,
    contentCount,
    setContentCount,
    postLength,
    setPostLength,
    purpose,
    setPurpose,
    inviteReaction,
    setInviteReaction,
    isGenerating,
    generatedPosts,
    editingIdx,
    editingContent,
    setEditingIdx,
    setEditingContent,
    onSavePost,
    onDeletePost,
    onGenerate,
    onPickTopic,
    onCancel,
    onSaveDraft,
    onPublish,
    accent,
    inkBalance,
    contentCost,
    regenCost,
  } = props;
  const isRegenerate = generatedPosts.length > 0;
  const currentCost = isRegenerate ? regenCost : contentCost;
  const insufficient = inkBalance < currentCost;

  if (!topic) {
    return (
      <EmptyState
        icon={<Inbox size={20} strokeWidth={1.5} />}
        title="작업할 주제를 골라주세요"
        description="주제 관리 탭에서 주제를 선택하면 콘텐츠 작업을 시작할 수 있습니다."
        action={
          <Button variant="primary" onClick={onPickTopic}>
            주제 관리로 이동
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Settings */}
      <Card className="p-6 lg:p-7 self-start">
        <div className="flex items-start justify-between mb-5">
          <div className="min-w-0">
            <p className="text-eyebrow text-ink-400 mb-2">선택된 주제</p>
            <p className="text-[15px] text-ink-800 leading-[1.55] mb-2">
              {topic.title}
            </p>
            <Badge variant="muted">{topic.category}</Badge>
          </div>
          <button
            onClick={onCancel}
            className="text-[12px] text-ink-400 hover:text-ink-700 transition-colors shrink-0"
          >
            변경
          </button>
        </div>

        <div className="border-t border-ink-200 pt-5 space-y-6">
          {/* Count slider — 1~5, default 3 */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <Label>콘텐츠 개수</Label>
              <span className="text-[11.5px] text-ink-500">
                <span className="text-ink-800 font-medium tabular-nums">
                  {contentCount}개
                </span>{" "}
                · {COUNT_SHAPES[contentCount as 1 | 2 | 3 | 4 | 5]?.label}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={contentCount}
              onChange={(e) => setContentCount(Number(e.target.value))}
              className="w-full accent-ink-800"
            />
            <div className="flex justify-between text-[10px] text-ink-400 mt-1 tabular-nums">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
            <p className="text-[11.5px] text-ink-500 mt-2 leading-[1.55]">
              {COUNT_SHAPES[contentCount as 1 | 2 | 3 | 4 | 5]?.desc}
            </p>
          </div>

          {/* Length slider — 3 steps (short / standard / long) */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <Label>콘텐츠 길이</Label>
              <span className="text-[11.5px] text-ink-500">
                <span className="text-ink-800 font-medium tabular-nums">
                  약 {LENGTH_PRESETS[postLength].midpoint}자
                </span>{" "}
                · {LENGTH_PRESETS[postLength].label}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={["short", "standard", "long"].indexOf(postLength)}
              onChange={(e) => {
                const next = ["short", "standard", "long"][
                  Number(e.target.value)
                ] as LengthKey;
                setPostLength(next);
              }}
              className="w-full accent-ink-800"
            />
            <div className="flex justify-between text-[10px] text-ink-400 mt-1">
              <span>짧게</span>
              <span>표준</span>
              <span>길게</span>
            </div>
            <p className="text-[11.5px] text-ink-500 mt-2 leading-[1.55]">
              {LENGTH_PRESETS[postLength].desc} · 포스트당{" "}
              {LENGTH_PRESETS[postLength].min}~{LENGTH_PRESETS[postLength].max}자
            </p>
          </div>

          {/* Purpose — reader reaction the user wants to drive */}
          <div>
            <Label hint="독자에게서 어떤 반응을 유도할지 정하면, 그에 맞는 톤과 마무리가 자동으로 적용됩니다.">
              어떤 반응을 유도할까요?
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(Object.keys(PURPOSES) as PurposeKey[]).map((key) => {
                const def = PURPOSES[key];
                const active = purpose === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPurpose(key)}
                    className={`px-3.5 py-3 rounded-[10px] border text-left transition-colors ${
                      active
                        ? "bg-ink-50 border-ink-700"
                        : "bg-paper border-ink-200 hover:border-ink-300"
                    }`}
                  >
                    <p className="text-[13.5px] font-medium text-ink-800 mb-1">
                      {def.label}
                    </p>
                    <p className="text-[11.5px] text-ink-500 leading-[1.45]">
                      {def.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reaction-invitation toggle */}
          <div>
            <button
              type="button"
              role="switch"
              aria-checked={inviteReaction}
              onClick={() => setInviteReaction(!inviteReaction)}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-[10px] border border-ink-200 bg-paper hover:border-ink-300 transition-colors text-left"
            >
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium text-ink-800 mb-0.5">
                  마무리에서 댓글·반응 유도
                </p>
                <p className="text-[11.5px] text-ink-500 leading-[1.45]">
                  페르소나 톤 그대로 자연스럽게 질문을 던지거나 독자에게 말을
                  걸며 마무리합니다.
                </p>
              </div>
              <span
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                  inviteReaction ? "bg-ink-800" : "bg-ink-200"
                }`}
                aria-hidden
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-paper transition-all ${
                    inviteReaction ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={onGenerate}
            disabled={isGenerating || insufficient}
            leadingIcon={<Sparkles size={15} strokeWidth={1.75} />}
            trailingIcon={
              <InkCost
                cost={currentCost}
                insufficient={insufficient}
                onDark
              />
            }
            className="w-full"
          >
            {isGenerating
              ? "콘텐츠 생성 중…"
              : insufficient
              ? "잉크 부족 — 충전 필요"
              : isRegenerate
              ? "다시 생성"
              : "콘텐츠 생성"}
          </Button>
        </div>
      </Card>

      {/* Output */}
      <div className="lg:sticky lg:top-2 self-start">
        <Card className="p-6 lg:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-eyebrow text-ink-400 mb-1.5">생성된 콘텐츠</p>
              <p className="text-[13px] text-ink-500 tabular-nums">
                {generatedPosts.length} / {contentCount} 포스트
              </p>
            </div>
            {generatedPosts.length > 0 && (
              <Badge variant="anima" dot dotColor={accent}>
                초안
              </Badge>
            )}
          </div>

          {isGenerating ? (
            <div className="space-y-2">
              {[...Array(contentCount)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : generatedPosts.length === 0 ? (
            <div className="border border-dashed border-ink-200 rounded-[10px] py-12 text-center">
              <p className="text-[13px] text-ink-400">
                아직 생성된 콘텐츠가 없습니다.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-5 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
                {generatedPosts.map((post, idx) => (
                  <Card
                    key={idx}
                    variant="muted"
                    className="p-3.5 group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-[10px] text-ink-400 tabular-nums mt-0.5">
                        0{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        {editingIdx === idx ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              rows={4}
                              className="text-[13px]"
                            />
                            <div className="flex gap-1.5 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingIdx(null)}
                              >
                                취소
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => onSavePost(idx)}
                              >
                                저장
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[13px] text-ink-700 leading-[1.65] whitespace-pre-wrap">
                            {post.content}
                          </p>
                        )}
                      </div>
                      {editingIdx !== idx && (
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingIdx(idx);
                              setEditingContent(post.content);
                            }}
                            className="p-1 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
                            aria-label="편집"
                          >
                            <Pencil size={12} strokeWidth={1.75} />
                          </button>
                          <button
                            onClick={() => onDeletePost(idx)}
                            className="p-1 rounded text-ink-400 hover:text-[#7c3a31] hover:bg-[rgba(181,86,74,0.10)] transition-colors"
                            aria-label="삭제"
                          >
                            <Trash2 size={12} strokeWidth={1.75} />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-ink-200">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={onGenerate}
                    disabled={inkBalance < regenCost}
                    leadingIcon={<RotateCcw size={13} strokeWidth={1.75} />}
                    trailingIcon={
                      <InkCost
                        cost={regenCost}
                        insufficient={inkBalance < regenCost}
                      />
                    }
                    className="flex-1"
                  >
                    다시 생성
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={onSaveDraft}
                    leadingIcon={<Save size={13} strokeWidth={1.75} />}
                    className="flex-1"
                  >
                    초안 저장
                  </Button>
                </div>
                <Button
                  variant="primary"
                  onClick={onPublish}
                  leadingIcon={<Send size={13} strokeWidth={1.75} />}
                  className="w-full"
                >
                  발행하기
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   History
   ============================================================ */

const HISTORY_PAGE_SIZE = 12;

function HistorySection(props: {
  contents: ThreadContent[];
  isLoading: boolean;
  draftCount: number;
  publishedCount: number;
  retentionDays: number | null;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onPublish: (content: ThreadContent) => void;
  onDelete: (id: string) => void;
}) {
  const {
    contents,
    isLoading,
    draftCount,
    publishedCount,
    retentionDays,
    expandedId,
    setExpandedId,
    onPublish,
    onDelete,
  } = props;

  // Persistent UI state
  const [activeGroup, setActiveGroup] = useState<"draft" | "published">(
    "draft"
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(HISTORY_PAGE_SIZE);

  // If there are no drafts but there are published items, jump to that view.
  useEffect(() => {
    if (draftCount === 0 && publishedCount > 0) {
      setActiveGroup("published");
    }
  }, [draftCount, publishedCount]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(HISTORY_PAGE_SIZE);
  }, [activeGroup, categoryFilter]);

  if (isLoading) {
    return (
      <div className="space-y-2 max-w-[820px]">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[80px]" />
        ))}
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <EmptyState
        icon={<Inbox size={20} strokeWidth={1.5} />}
        title="히스토리가 비어 있습니다"
        description="콘텐츠를 발행하면 이 곳에 누적됩니다."
      />
    );
  }

  // Group toggles
  const groupItems =
    activeGroup === "draft"
      ? contents.filter((c) => c.status === "draft")
      : contents.filter((c) => c.status === "published");

  // Categories present in current group
  const categoryCounts = groupItems.reduce<Record<string, number>>((acc, c) => {
    const key = c.category || "기타";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const categoryEntries = Object.entries(categoryCounts).sort((a, b) =>
    a[0].localeCompare(b[0], "ko")
  );

  // Filter
  const filtered =
    categoryFilter === "all"
      ? groupItems
      : groupItems.filter((c) => (c.category || "기타") === categoryFilter);

  // Sort newest first by best available timestamp
  const sorted = [...filtered].sort((a, b) => {
    const at = new Date(a.publishedAt || a.createdAt).getTime();
    const bt = new Date(b.publishedAt || b.createdAt).getTime();
    return bt - at;
  });

  // Group by relative date
  const dateBuckets = groupByRelativeDate(sorted, (c) =>
    activeGroup === "published" ? c.publishedAt || c.createdAt : c.createdAt
  );

  // Apply pagination across the flat sorted list, then re-bucket
  const visible = sorted.slice(0, visibleCount);
  const visibleBuckets = groupByRelativeDate(visible, (c) =>
    activeGroup === "published" ? c.publishedAt || c.createdAt : c.createdAt
  );
  const hasMore = visibleCount < sorted.length;

  return (
    <div className="max-w-[820px] animate-fade-in">
      {/* Group toggle */}
      <div className="flex items-center gap-1 mb-5 p-0.5 bg-ink-100 rounded-[8px] w-fit">
        <GroupTab
          active={activeGroup === "draft"}
          onClick={() => {
            setActiveGroup("draft");
            setCategoryFilter("all");
          }}
          label="초안"
          count={draftCount}
        />
        <GroupTab
          active={activeGroup === "published"}
          onClick={() => {
            setActiveGroup("published");
            setCategoryFilter("all");
          }}
          label="발행됨"
          count={publishedCount}
        />
      </div>

      {/* Category chips */}
      {categoryEntries.length > 0 && (
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 -mb-px">
          <CategoryChip
            active={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
            label="전체"
            count={groupItems.length}
          />
          {categoryEntries.map(([cat, count]) => (
            <CategoryChip
              key={cat}
              active={categoryFilter === cat}
              onClick={() => setCategoryFilter(cat)}
              label={cat}
              count={count}
            />
          ))}
        </div>
      )}

      {/* Retention notice (free plan, published view) */}
      {retentionDays != null && activeGroup === "published" && (
        <p className="text-[12px] text-ink-400 leading-[1.6] mb-5 -mt-1">
          무료 플랜은 발행 히스토리를 최근 {retentionDays}일까지만 보여드립니다.
          이전 기록까지 보관하려면 Pro 이상으로 업그레이드하세요.
        </p>
      )}

      {/* Empty state for current view */}
      {sorted.length === 0 ? (
        <p className="text-[13px] text-ink-400 px-1 py-10 text-center">
          {activeGroup === "draft"
            ? "초안이 없습니다."
            : "발행된 콘텐츠가 없습니다."}
        </p>
      ) : (
        <div className="space-y-9">
          {visibleBuckets.map((bucket) => (
            <section key={bucket.key}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-[12px] font-medium text-ink-700 tracking-[-0.005em]">
                  {bucket.label}
                </h3>
                <span className="font-mono text-[10.5px] tabular-nums text-ink-400">
                  {bucket.items.length}
                </span>
                <span className="flex-1 h-px bg-ink-200/60 ml-2" />
              </div>
              <ul className="space-y-2">
                {bucket.items.map((c) => (
                  <HistoryItem
                    key={c.id}
                    content={c}
                    expanded={expandedId === c.id}
                    setExpanded={(open) =>
                      setExpandedId(open ? c.id : null)
                    }
                    showPublish={activeGroup === "draft"}
                    onPublish={onPublish}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </section>
          ))}

          {hasMore && (
            <div className="pt-2 flex justify-center">
              <Button
                variant="secondary"
                size="md"
                onClick={() =>
                  setVisibleCount((n) => n + HISTORY_PAGE_SIZE)
                }
              >
                더 보기 ({sorted.length - visibleCount}개 남음)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* dateBuckets unused export keeps tree-shaking happy in case of future use */}
      <span className="hidden">{dateBuckets.length}</span>
    </div>
  );
}

function GroupTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 h-8 rounded-[6px] text-[12.5px] font-medium transition-colors ${
        active
          ? "bg-paper text-ink-800 shadow-[0_1px_2px_rgba(11,10,7,0.06)]"
          : "text-ink-500 hover:text-ink-700"
      }`}
    >
      {label}
      <span
        className={`tabular-nums font-mono text-[10.5px] ${
          active ? "text-ink-400" : "text-ink-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-[12px] font-medium border transition-colors ${
        active
          ? "bg-ink-800 border-ink-800 text-ink-50"
          : "bg-paper border-ink-200 text-ink-600 hover:border-ink-300 hover:text-ink-800"
      }`}
    >
      <span>{label}</span>
      <span
        className={`tabular-nums font-mono text-[10.5px] ${
          active ? "text-ink-300" : "text-ink-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function HistoryItem({
  content,
  expanded,
  setExpanded,
  showPublish,
  onPublish,
  onDelete,
}: {
  content: ThreadContent;
  expanded: boolean;
  setExpanded: (open: boolean) => void;
  showPublish: boolean;
  onPublish: (content: ThreadContent) => void;
  onDelete: (id: string) => void;
}) {
  const dateStr = (() => {
    const ts = content.publishedAt || content.createdAt;
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  })();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        `"${content.input.topic}" 콘텐츠를 삭제하시겠습니까?`
      )
    ) {
      onDelete(content.id);
    }
  };

  return (
    <li>
      <Card className="overflow-hidden group">
        <div className="flex items-stretch">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 min-w-0 text-left px-5 py-4 flex items-center gap-3 hover:bg-ink-50 transition-colors"
          >
            <CheckCircle2
              size={14}
              strokeWidth={1.75}
              className={
                content.status === "published"
                  ? "text-anima-500"
                  : "text-ink-300"
              }
            />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-ink-800 leading-[1.55] truncate">
                {content.input.topic}
              </p>
              <p className="text-[11.5px] text-ink-400 mt-0.5 truncate">
                {[content.category, `${content.output.posts.length} posts`, dateStr]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <ChevronRight
              size={14}
              strokeWidth={1.75}
              className={`text-ink-400 shrink-0 transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            />
          </button>

          <div className="flex items-center pr-3 gap-1 shrink-0">
            {showPublish && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(content);
                }}
              >
                발행
              </Button>
            )}
            <button
              onClick={handleDelete}
              className="p-1.5 rounded text-ink-400 hover:text-[#7c3a31] hover:bg-[rgba(181,86,74,0.08)] transition-colors opacity-0 group-hover:opacity-100"
              aria-label="삭제"
              title="삭제"
            >
              <Trash2 size={13} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {expanded && content.output?.posts && (
          <div className="border-t border-ink-200 px-5 py-4 bg-ink-50/40 space-y-2">
            {content.output.posts.map((p, i) => (
              <Card key={i} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-[10px] text-ink-400 tabular-nums">
                    0{i + 1}
                  </span>
                  <p className="text-[13px] text-ink-700 leading-[1.65] whitespace-pre-wrap flex-1">
                    {p.content}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </li>
  );
}
