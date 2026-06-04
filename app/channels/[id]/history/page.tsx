'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks';
import { channelStorage, contentStorage } from '@/app/lib/storage';
import { Channel, ThreadContent } from '@/app/types';
import Link from 'next/link';

type StatusFilter = 'all' | 'draft' | 'published';

export default function HistoryPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const channelId = params.id as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [contents, setContents] = useState<ThreadContent[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  useEffect(() => {
    if (session && channelId) {
      const ch = channelStorage.getChannel(channelId);
      if (ch) {
        setChannel(ch);
        const loaded = contentStorage.getContentsByChannelId(channelId);
        setContents(loaded);
      } else {
        router.push('/channels');
      }
    }
  }, [session, channelId, router]);

  const handleDelete = (id: string) => {
    if (confirm('삭제하시겠습니까?')) {
      contentStorage.deleteContent(id);
      setContents(contents.filter((c) => c.id !== id));
    }
  };

  const filtered = contents
    .filter((c) => (statusFilter === 'all' ? true : c.status === statusFilter))
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
    });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700',
      published: 'bg-green-100 text-green-700',
    };
    return styles[status] || '';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '임시저장',
      published: '발행됨',
    };
    return labels[status] || status;
  };

  if (!session || !channel) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href={`/channels/${channelId}/worldbuilding`}>
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm">
              ← 돌아가기
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {channel.name} - 콘텐츠 히스토리
          </h1>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 필터 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 items-center justify-between">
          <div className="flex gap-2">
            <span className="text-sm font-medium text-slate-700">상태:</span>
            {(['all', 'draft', 'published'] as StatusFilter[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {status === 'all' ? '전체' : getStatusLabel(status)}
                </button>
              )
            )}
          </div>

          <div className="flex gap-2">
            <span className="text-sm font-medium text-slate-700">정렬:</span>
            {(['latest', 'oldest'] as const).map((order) => (
              <button
                key={order}
                onClick={() => setSortOrder(order)}
                className={`px-3 py-1 rounded text-sm transition ${
                  sortOrder === order
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {order === 'latest' ? '최신순' : '오래된순'}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 리스트 */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">아직 생성된 콘텐츠가 없습니다.</p>
            <Link href={`/channels/${channelId}/thread/create`}>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Thread 생성하기
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((content) => {
              const createdDate = new Date(content.createdAt);
              const now = new Date();
              const daysAgo = Math.floor(
                (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              const dateLabel =
                daysAgo === 0
                  ? '오늘'
                  : daysAgo === 1
                  ? '어제'
                  : `${daysAgo}일 전`;

              return (
                <div
                  key={content.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {content.input.topic}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{dateLabel}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${getStatusBadge(
                        content.status
                      )}`}
                    >
                      {getStatusLabel(content.status)}
                    </span>
                  </div>

                  <div className="mb-4 text-sm text-slate-600">
                    <p>
                      <strong>훅 스타일:</strong> {content.input.hookStyle}
                    </p>
                    <p>
                      <strong>게시물:</strong> {content.output.posts.length}개
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm transition">
                      편집
                    </button>
                    {content.status === 'draft' && (
                      <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm transition">
                        발행
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(content.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
