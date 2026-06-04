'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks';
import { channelStorage, contentStorage, generateId } from '@/app/lib/storage';
import { Channel, ThreadContent } from '@/app/types';
import Link from 'next/link';

type Step = 'input' | 'hooks' | 'posts';

export default function ThreadCreatePage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const channelId = params.id as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [step, setStep] = useState<Step>('input');

  // Input form state
  const [topic, setTopic] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [hookStyle, setHookStyle] = useState('공감형');
  const [length, setLength] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Hooks state
  const [generatedHooks, setGeneratedHooks] = useState<string[]>([]);
  const [selectedHook, setSelectedHook] = useState('');

  // Posts state
  const [generatedPosts, setGeneratedPosts] = useState<
    Array<{ order: number; content: string }>
  >([]);
  const [editingPostIdx, setEditingPostIdx] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (session && channelId) {
      const ch = channelStorage.getChannel(channelId);
      if (ch) {
        setChannel(ch);
      } else {
        router.push('/channels');
      }
    }
  }, [session, channelId, router]);

  const handleGenerateHooks = async () => {
    if (!topic.trim()) {
      setError('주제를 입력해주세요.');
      return;
    }

    if (!channel) return;

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/thread/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldBuilding: channel.worldBuilding,
          topic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hooks');
      }

      const data = await response.json();
      setGeneratedHooks(data.hooks);
      setStep('hooks');
    } catch (err) {
      setError('훅 생성 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHook = async (hook: string) => {
    setSelectedHook(hook);
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/thread/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldBuilding: channel?.worldBuilding,
          topic,
          selectedHook: hook,
          length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate posts');
      }

      const data = await response.json();
      setGeneratedPosts(data.posts);
      setStep('posts');
    } catch (err) {
      setError('게시물 생성 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditPost = (idx: number) => {
    setEditingPostIdx(idx);
    setEditingContent(generatedPosts[idx].content);
  };

  const handleSaveEdit = (idx: number) => {
    const updated = [...generatedPosts];
    updated[idx].content = editingContent;
    setGeneratedPosts(updated);
    setEditingPostIdx(null);
  };

  const handleDeletePost = (idx: number) => {
    setGeneratedPosts(generatedPosts.filter((_, i) => i !== idx));
  };

  const handleSaveContent = async () => {
    if (!channel || generatedPosts.length === 0) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const content: ThreadContent = {
        id: generateId('content'),
        channelId: channel.id,
        type: 'thread',
        status: 'draft',
        input: {
          topic,
          referenceUrl,
          hookStyle,
          length,
        },
        output: {
          hook: selectedHook,
          posts: generatedPosts,
        },
        createdAt: new Date().toISOString(),
      };

      contentStorage.addContent(content);
      setSaveMessage('저장되었습니다!');
      setTimeout(() => {
        router.push(`/channels/${channel.id}/history`);
      }, 1000);
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!session || !channel) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link href={`/channels/${channelId}/worldbuilding`}>
              <span className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm">
                ← 돌아가기
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {channel.name} - Thread 생성
            </h1>
          </div>
          {saveMessage && (
            <span className="text-green-600 font-medium">{saveMessage}</span>
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 입력 폼 */}
        {step === 'input' && (
          <div className="bg-white rounded-lg shadow p-8 max-w-md">
            <h2 className="text-xl font-bold mb-6">Thread 생성 설정</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  주제/키워드 *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setError('');
                  }}
                  placeholder="예: 오늘 원가계산 하다가 현타옴"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  참고 URL (선택)
                </label>
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  훅 스타일 *
                </label>
                <div className="space-y-2">
                  {['질문형', '공감형', '반전형', '정보형'].map((style) => (
                    <label key={style} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="hookStyle"
                        value={style}
                        checked={hookStyle === style}
                        onChange={(e) => setHookStyle(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Thread 길이 *
                </label>
                <div className="flex gap-2">
                  {[3, 5, 7].map((len) => (
                    <button
                      key={len}
                      onClick={() => setLength(len)}
                      className={`flex-1 py-2 rounded-lg transition ${
                        length === len
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {len}개
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerateHooks}
                disabled={isGenerating}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition"
              >
                {isGenerating ? '생성 중...' : '훅 생성하기'}
              </button>
            </div>
          </div>
        )}

        {/* 훅 선택 */}
        {step === 'hooks' && (
          <div>
            <h2 className="text-xl font-bold mb-4">생성된 훅 선택</h2>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {generatedHooks.map((hook, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectHook(hook)}
                  disabled={isGenerating}
                  className="p-4 border-2 border-slate-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-left"
                >
                  <p className="text-slate-700">{hook}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('input')}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              ← 다시 선택
            </button>
          </div>
        )}

        {/* 게시물 편집 */}
        {step === 'posts' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Thread 게시물 편집</h2>

            {/* 훅 표시 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-slate-900 mb-2">선택된 훅:</h3>
              <p className="text-slate-700">{selectedHook}</p>
            </div>

            {/* 게시물 */}
            <div className="space-y-4 mb-6">
              {generatedPosts.map((post, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-slate-300 rounded-lg bg-white"
                >
                  <h4 className="font-medium text-slate-900 mb-2">게시물 #{post.order}</h4>

                  {editingPostIdx === idx ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingPostIdx(null)}
                          className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-700 mb-2 whitespace-pre-wrap">
                        {post.content}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPost(idx)}
                          className="px-3 py-1 text-sm hover:bg-slate-100 rounded transition"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeletePost(idx)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep('hooks');
                  setSelectedHook('');
                  setGeneratedPosts([]);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                ← 훅 다시 선택
              </button>
              <button
                onClick={handleSaveContent}
                disabled={isSaving || generatedPosts.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg transition"
              >
                {isSaving ? '저장 중...' : '저장 및 히스토리로'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
