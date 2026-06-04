'use client';

import { Channel, IdeaItem, ThreadContent, IDEA_CATEGORY_GROUPS } from '@/app/types';
import { contentStorage, generateId, ideaStorage } from '@/app/lib/supabase-storage';
import { useState, useEffect } from 'react';

type ThreadSubTab = 'generate' | 'manage' | 'waiting' | 'history';
type GenerateStep = 'topic-input' | 'topic-list';
type WaitingStep = 'settings';

interface ThreadTabProps {
  channel: Channel;
}

const POST_LENGTHS = {
  short: { label: '짧음 (100-150자)', min: 100, max: 150 },
  medium: { label: '중간 (200-300자)', min: 200, max: 300 },
  long: { label: '길음 (400-500자)', min: 400, max: 500 },
} as const;

export default function ThreadTab({ channel }: ThreadTabProps) {
  const [subTab, setSubTab] = useState<ThreadSubTab>('generate');
  const [generateStep, setGenerateStep] = useState<GenerateStep>('topic-input');
  const [selectedCategory, setSelectedCategory] = useState('마케팅 전략');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [selectedIdeaIndices, setSelectedIdeaIndices] = useState<Set<number>>(new Set());
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [ideaError, setIdeaError] = useState('');

  const [topics, setTopics] = useState<IdeaItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  const [waitingStep, setWaitingStep] = useState<WaitingStep>('settings');
  const [selectedTopic, setSelectedTopic] = useState<IdeaItem | null>(null);

  const [contentCount, setContentCount] = useState(5);
  const [hookStyleDistribution, setHookStyleDistribution] = useState({
    empathy: 60,
    question: 40,
    shock: 0,
  });
  const [postLength, setPostLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [lastPostFormat, setLastPostFormat] = useState<'question' | 'declaration'>('question');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingError, setGeneratingError] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState<Array<{ order: number; content: string }>>([]);
  const [editingPostIdx, setEditingPostIdx] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const [publishedContents, setPublishedContents] = useState<ThreadContent[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null);

  // 주제 로드
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const loaded = await ideaStorage.getIdeas(channel.id);
        setTopics(loaded);
      } catch (error) {
        console.error('Failed to load topics:', error);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    loadTopics();
  }, [channel.id]);

  // 콘텐츠 로드
  useEffect(() => {
    const loadContents = async () => {
      try {
        const draft = await contentStorage.getContentsByStatus(channel.id, 'draft');
        const published = await contentStorage.getContentsByStatus(channel.id, 'published');
        setPublishedContents([...draft, ...published]);
      } catch (error) {
        console.error('Failed to load contents:', error);
      } finally {
        setIsLoadingContents(false);
      }
    };
    loadContents();
  }, [channel.id]);

  const handleGenerateIdeas = async () => {
    if (!ideaPrompt.trim()) {
      setIdeaError('주제를 입력해주세요.');
      return;
    }

    setIsGeneratingIdeas(true);
    setIdeaError('');

    try {
      const prompt = `${channel.worldBuilding.basic.name} 캐릭터로 "${ideaPrompt}"에 관련된 Thread 주제 10개를 생성해주세요.
각 주제는 한 줄로, 구체적이고 재미있는 콘텐츠 주제여야 합니다.
번호를 붙여서 작성해주세요.`;

      const response = await fetch('/api/thread/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldBuilding: channel.worldBuilding,
          topic: prompt,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate ideas');
      const data = await response.json();

      const ideas = data.hooks
        .map((h: string) => h.replace(/^\d+\.\s*/, '').trim())
        .filter((h: string) => h.length > 0)
        .slice(0, 10);

      setGeneratedIdeas(ideas);
      setGenerateStep('topic-list');
    } catch (error) {
      setIdeaError('아이디어 생성에 실패했습니다.');
      console.error(error);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleSaveIdeas = async () => {
    if (selectedIdeaIndices.size === 0) {
      setIdeaError('최소 하나의 주제를 선택해주세요.');
      return;
    }

    try {
      const selectedIdeas = Array.from(selectedIdeaIndices)
        .map(idx => generatedIdeas[idx])
        .filter(Boolean);

      for (const idea of selectedIdeas) {
        await ideaStorage.addIdea({
          id: generateId('idea'),
          channelId: channel.id,
          title: idea,
          category: selectedCategory,
          createdAt: new Date().toISOString(),
        });
      }

      const loaded = await ideaStorage.getIdeas(channel.id);
      setTopics(loaded);

      setGeneratedIdeas([]);
      setSelectedIdeaIndices(new Set());
      setIdeaPrompt('');
      setGenerateStep('topic-input');
      setSubTab('manage');
      setSuccessMessage(`${selectedIdeas.length}개의 주제가 저장되었습니다.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setIdeaError('저장에 실패했습니다.');
      console.error(error);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await ideaStorage.deleteIdea(id);
      const loaded = await ideaStorage.getIdeas(channel.id);
      setTopics(loaded);
    } catch (error) {
      console.error('Failed to delete idea:', error);
    }
  };

  const generateContent = async () => {
    if (!selectedTopic || !channel.worldBuilding) return;

    setIsGenerating(true);
    setGeneratingError('');

    try {
      const response = await fetch('/api/thread/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldBuilding: channel.worldBuilding,
          topic: selectedTopic.title,
          selectedHook: selectedTopic.title,
          length: contentCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }
      const data = await response.json();

      if (!data.posts || data.posts.length === 0) {
        throw new Error('No posts generated - API returned empty response');
      }

      setGeneratedPosts(data.posts);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to generate content';
      setGeneratingError(errorMsg);
      console.error('Generation error:', errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePost = (idx: number) => {
    setGeneratedPosts(generatedPosts.filter((_, i) => i !== idx));
  };

  const handleSavePost = (idx: number) => {
    if (editingContent.trim()) {
      const updated = [...generatedPosts];
      updated[idx].content = editingContent;
      setGeneratedPosts(updated);
      setEditingPostIdx(null);
    }
  };

  const handleSaveContent = async () => {
    if (!selectedTopic || generatedPosts.length === 0) return;

    try {
      const content: ThreadContent = {
        id: generateId('content'),
        channelId: channel.id,
        type: 'thread',
        status: 'draft',
        ideaId: selectedTopic.id,
        category: selectedTopic.category,
        input: {
          topic: selectedTopic.title,
          referenceUrl: '',
          hookStyle: '',
          length: contentCount,
        },
        output: {
          hook: selectedTopic.title,
          posts: generatedPosts,
        },
        createdAt: new Date().toISOString(),
      };

      await contentStorage.addContent(content);
      const loaded = await contentStorage.getContentsByStatus(channel.id, 'draft');
      const published = await contentStorage.getContentsByStatus(channel.id, 'published');
      setPublishedContents([...loaded, ...published]);

      setSuccessMessage('콘텐츠가 저장되었습니다!');
      setTimeout(() => setSuccessMessage(''), 3000);

      setGeneratedPosts([]);
      setSelectedTopic(null);
      setEditingPostIdx(null);
    } catch (error) {
      console.error('저장 오류:', error);
    }
  };

  const handlePublishContent = async () => {
    if (!selectedTopic || generatedPosts.length === 0) return;

    try {
      const content: ThreadContent = {
        id: generateId('content'),
        channelId: channel.id,
        type: 'thread',
        status: 'published',
        ideaId: selectedTopic.id,
        category: selectedTopic.category,
        input: {
          topic: selectedTopic.title,
          referenceUrl: '',
          hookStyle: '',
          length: contentCount,
        },
        output: {
          hook: selectedTopic.title,
          posts: generatedPosts,
        },
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await contentStorage.addContent(content);
      const draft = await contentStorage.getContentsByStatus(channel.id, 'draft');
      const published = await contentStorage.getContentsByStatus(channel.id, 'published');
      setPublishedContents([...draft, ...published]);

      setSuccessMessage('콘텐츠가 발행되었습니다!');
      setTimeout(() => setSuccessMessage(''), 3000);

      setGeneratedPosts([]);
      setSelectedTopic(null);
      setEditingPostIdx(null);
    } catch (error) {
      console.error('발행 오류:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSubTab('generate')}
          className={`px-4 py-2 font-medium transition ${
            subTab === 'generate'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📝 생성 ({topics.length})
        </button>
        <button
          onClick={() => setSubTab('manage')}
          className={`px-4 py-2 font-medium transition ${
            subTab === 'manage'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 주제관리 ({topics.length})
        </button>
        <button
          onClick={() => setSubTab('waiting')}
          className={`px-4 py-2 font-medium transition ${
            subTab === 'waiting'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⏳ 업로드대기
        </button>
        <button
          onClick={() => setSubTab('history')}
          className={`px-4 py-2 font-medium transition ${
            subTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ✓ 히스토리
        </button>
      </div>

      {/* 메시지 */}
      {successMessage && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">{successMessage}</div>
      )}

      {/* [생성] 탭 */}
      {subTab === 'generate' && (
        <div className="space-y-4">
          {generateStep === 'topic-input' && (
            <div className="border border-gray-300 rounded-lg p-6 space-y-4">
              <div>
                <label className="block font-medium mb-3">카테고리</label>
                <div className="space-y-3">
                  {Object.entries(IDEA_CATEGORY_GROUPS).map(([key, group]) => (
                    <div key={key}>
                      <p className="text-xs text-gray-500 font-semibold mb-2">{group.label}</p>
                      <div className="flex flex-wrap gap-2 pb-3 border-b border-gray-200">
                        {group.categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setShowCustomCategoryInput(false);
                              setCustomCategory('');
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                              selectedCategory === cat && !showCustomCategoryInput
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* 직접 입력 섹션 */}
                  <div className="pt-2">
                    {!showCustomCategoryInput ? (
                      <button
                        onClick={() => setShowCustomCategoryInput(true)}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition border border-dashed border-gray-300"
                      >
                        ➕ 직접 입력
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="카테고리명 입력"
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customCategory.trim()) {
                              setSelectedCategory(customCategory);
                              setShowCustomCategoryInput(false);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (customCategory.trim()) {
                              setSelectedCategory(customCategory);
                              setShowCustomCategoryInput(false);
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          확인
                        </button>
                        <button
                          onClick={() => {
                            setShowCustomCategoryInput(false);
                            setCustomCategory('');
                          }}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">주제 입력</label>
                <textarea
                  value={ideaPrompt}
                  onChange={(e) => setIdeaPrompt(e.target.value)}
                  placeholder="예: 자영업 경영 팁"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                />
              </div>

              {ideaError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {ideaError}
                </div>
              )}

              <button
                onClick={handleGenerateIdeas}
                disabled={isGeneratingIdeas}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium"
              >
                {isGeneratingIdeas ? '⏳ 생성중...' : '✨ 생성'}
              </button>
            </div>
          )}

          {generateStep === 'topic-list' && (
            <div className="border border-gray-300 rounded-lg p-6 space-y-4">
              <h3 className="font-bold text-lg">생성된 주제 ({generatedIdeas.length}개)</h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {generatedIdeas.map((idea, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50">
                    <input
                      type="checkbox"
                      checked={selectedIdeaIndices.has(idx)}
                      onChange={(e) => {
                        const newSet = new Set(selectedIdeaIndices);
                        if (e.target.checked) {
                          newSet.add(idx);
                        } else {
                          newSet.delete(idx);
                        }
                        setSelectedIdeaIndices(newSet);
                      }}
                    />
                    <span className="flex-1">{idea}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setGenerateStep('topic-input');
                    setGeneratedIdeas([]);
                    setSelectedIdeaIndices(new Set());
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  다시 생성
                </button>
                <button
                  onClick={handleSaveIdeas}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  저장하기
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* [주제관리] 탭 */}
      {subTab === 'manage' && (
        <div className="grid grid-cols-3 gap-6">
          {/* 좌측: 카테고리 목록 사이드바 */}
          <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-4 h-fit sticky top-6">
            <h3 className="font-bold text-lg mb-4">카테고리</h3>
            <div className="space-y-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  categoryFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                전체 ({topics.length})
              </button>
              {Object.keys(
                topics.reduce((acc, topic) => {
                  acc[topic.category] = (acc[topic.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort()
                .map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                      categoryFilter === category
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category} (
                    {topics.filter((t) => t.category === category).length})
                  </button>
                ))}
            </div>
          </div>

          {/* 우측: 주제 목록 */}
          <div className="col-span-2">
            {isLoadingTopics ? (
              <p className="text-gray-500">로딩 중...</p>
            ) : topics.length === 0 ? (
              <p className="text-gray-500">저장된 주제가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {topics
                  .filter((topic) => categoryFilter === 'all' || topic.category === categoryFilter)
                  .map((topic) => (
                    <div key={topic.id} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition">
                      <div className="mb-3">
                        <p className="font-bold text-lg text-gray-900">{topic.title}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {topic.category}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedTopic(topic);
                            setSubTab('waiting');
                          }}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          ✨ 생성
                        </button>
                        <button
                          onClick={() => handleDeleteIdea(topic.id)}
                          className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                        >
                          🗑️ 삭제
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* [업로드대기] 탭 */}
      {subTab === 'waiting' && selectedTopic && (
        <div className="grid grid-cols-2 gap-6">
          {/* 좌측: 설정 */}
          <div className="border border-gray-300 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">주제: {selectedTopic.title}</h3>
              <p className="text-sm text-gray-600">카테고리: {selectedTopic.category}</p>
            </div>

            <div className="space-y-3">
              <label className="block font-medium">콘텐츠 개수</label>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setContentCount(num)}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      contentCount === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {num}개
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block font-medium">포스트 길이</label>
              <div className="space-y-2">
                {Object.entries(POST_LENGTHS).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="postLength"
                      checked={postLength === key}
                      onChange={() => setPostLength(key as 'short' | 'medium' | 'long')}
                    />
                    <span className="text-sm">{value.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  setGeneratedPosts([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={generateContent}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium"
              >
                {isGenerating ? '⏳ 생성중...' : '✨ 생성 시작'}
              </button>
            </div>
          </div>

          {/* 우측: 생성된 콘텐츠 */}
          {selectedTopic && (
            <div className="border border-gray-300 rounded-lg p-6 sticky top-6 h-fit max-h-[calc(100vh-100px)] overflow-y-auto bg-white">
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">📝 생성된 콘텐츠</h3>
                <p className="text-sm text-gray-600">{generatedPosts.length}개</p>
              </div>

              {generatingError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4 text-sm">
                  {generatingError}
                </div>
              )}

              {generatedPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">생성 시작을 눌러 콘텐츠를 생성하세요</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {generatedPosts.map((post, idx) => (
                      <div key={idx} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex-1" />
                          {editingPostIdx !== idx && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingPostIdx(idx);
                                  setEditingContent(post.content);
                                }}
                                className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-200 rounded"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeletePost(idx)}
                                className="text-xs px-2 py-1 text-red-600 hover:bg-red-200 rounded"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>

                        {editingPostIdx === idx ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full px-2 py-2 border border-gray-300 rounded text-xs"
                              rows={3}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingPostIdx(null)}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleSavePost(idx)}
                                className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                저장
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs whitespace-pre-wrap text-gray-700 leading-relaxed">{post.content}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4 border-t flex-col">
                    <button
                      onClick={() => {
                        setGeneratedPosts([]);
                        setEditingPostIdx(null);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      다시 생성
                    </button>
                    <button
                      onClick={handleSaveContent}
                      className="w-full px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                    >
                      💾 저장
                    </button>
                    <button
                      onClick={handlePublishContent}
                      className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      ✅ 발행
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* [히스토리] 탭 */}
      {subTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-3 text-blue-600">💾 미발행 ({publishedContents.filter(c => c.status === 'draft').length})</h3>
            {publishedContents.filter(c => c.status === 'draft').length === 0 ? (
              <p className="text-gray-500 text-sm">미발행된 콘텐츠가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {publishedContents.filter(c => c.status === 'draft').map((content) => (
                  <div key={content.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <button
                        onClick={() => setExpandedContentId(expandedContentId === content.id ? null : content.id)}
                        className="flex-1 text-left hover:bg-blue-100 rounded transition"
                      >
                        <p className="font-bold text-blue-900">{content.input.topic}</p>
                        <p className="text-xs text-gray-600 mt-1">{content.category}</p>
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await contentStorage.updateContent(content.id, {
                              status: 'published',
                              publishedAt: new Date().toISOString(),
                            });
                            const draft = await contentStorage.getContentsByStatus(channel.id, 'draft');
                            const published = await contentStorage.getContentsByStatus(channel.id, 'published');
                            setPublishedContents([...draft, ...published]);
                            setSuccessMessage('콘텐츠가 발행되었습니다!');
                            setTimeout(() => setSuccessMessage(''), 3000);
                          } catch (error) {
                            console.error('발행 실패:', error);
                          }
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 whitespace-nowrap"
                      >
                        발행
                      </button>
                    </div>
                    {expandedContentId === content.id && content.output?.posts && (
                      <div className="mt-4 pt-4 border-t border-blue-200 space-y-2">
                        {content.output.posts.map((post: any, idx: number) => (
                          <div key={idx} className="bg-white rounded p-3 text-sm">
                            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3 text-green-600">✅ 발행됨 ({publishedContents.filter(c => c.status === 'published').length})</h3>
            {publishedContents.filter(c => c.status === 'published').length === 0 ? (
              <p className="text-gray-500 text-sm">발행된 콘텐츠가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {publishedContents.filter(c => c.status === 'published').map((content) => (
                  <div key={content.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <button
                      onClick={() => setExpandedContentId(expandedContentId === content.id ? null : content.id)}
                      className="w-full text-left hover:bg-green-100 rounded transition"
                    >
                      <p className="font-bold text-green-900">{content.input.topic}</p>
                      <p className="text-xs text-gray-600 mt-1">{content.category}</p>
                    </button>
                    {expandedContentId === content.id && content.output?.posts && (
                      <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
                        {content.output.posts.map((post: any, idx: number) => (
                          <div key={idx} className="bg-white rounded p-3 text-sm">
                            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
