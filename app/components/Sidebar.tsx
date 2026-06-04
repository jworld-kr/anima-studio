'use client';

import { Channel } from '@/app/types';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  channels: Channel[];
  onChannelSelect: (channelId: string) => void;
  onSettingsClick?: (channelId: string) => void;
}

export default function Sidebar({ channels, onChannelSelect, onSettingsClick }: SidebarProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const currentChannelId = params.channelId as string;
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(currentChannelId);
  const router = useRouter();

  const currentCategory = searchParams.get('category') || 'thread';

  const categories = [
    { id: 'thread', label: 'Thread', logo: '/thread-logo.svg', disabled: false },
    { id: 'shorts', label: 'Shorts', logo: '/shorts-logo.svg', disabled: true },
    { id: 'insta-post', label: 'Instagram', logo: '/instagram-logo.svg', disabled: true },
    { id: 'blog', label: 'Blog', logo: '/blog-logo.svg', disabled: true },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 h-screen flex flex-col sticky top-0">
      {/* 헤더 */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🗡️</span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" style={{ fontFamily: 'Shilla Culture' }}>기사문AI</h2>
        </div>
        <p className="text-xs text-slate-600 ml-9 font-medium">종합 마케팅 관리</p>
      </div>

      {/* 채널 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {channels.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">채널이 없습니다</p>
        ) : (
          channels.map((channel) => (
            <div key={channel.id}>
              {/* 채널 헤더 */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition ${currentChannelId === channel.id
                  ? 'bg-blue-50 border-l-4 border-blue-600'
                  : 'hover:bg-slate-100'
                  }`}
              >
                <button
                  onClick={() => {
                    onChannelSelect(channel.id);
                    setExpandedChannelId(expandedChannelId === channel.id ? null : channel.id);
                  }}
                  className="flex items-center gap-3 flex-1"
                >
                  {channel.thumbnail && (
                    <img
                      src={channel.thumbnail}
                      alt={channel.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  {!channel.thumbnail && (
                    <div className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
                      {channel.name[0]}
                    </div>
                  )}
                  <span className="font-medium text-slate-900 truncate">{channel.name}</span>
                </button>

                {/* 세계관 설정 버튼 */}
                <Link href={`/channels/${channel.id}/worldbuilding`}>
                  <button
                    className="p-2 hover:bg-slate-200 rounded transition"
                    title="세계관 설정"
                  >
                    ⚙️
                  </button>
                </Link>
              </div>

              {/* 카테고리 목록 */}
              {expandedChannelId === channel.id && (
                <div className="ml-2 mt-2 space-y-1 border-l-2 border-blue-200 pl-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (!cat.disabled) {
                          onChannelSelect(channel.id);
                          // URL은 실제 라우팅에서 처리
                        }
                      }}
                      disabled={cat.disabled}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition flex items-center gap-3 ${cat.disabled
                        ? 'text-slate-400 cursor-not-allowed opacity-50'
                        : currentChannelId === channel.id && currentCategory === cat.id
                          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-900 font-medium shadow-sm'
                          : 'text-slate-600 hover:bg-blue-50'
                        }`}
                    >
                      <img
                        src={cat.logo}
                        alt={cat.label}
                        className={`w-5 h-5 ${cat.disabled ? 'opacity-50' : ''}`}
                      />
                      <span className="font-medium flex-1">{cat.label}</span>
                      {cat.disabled && <span className="text-xs text-slate-400">(준비중)</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 새 채널 버튼 */}
      <div className="p-4 border-t border-slate-200">
        <Link href="/channels/new">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition text-sm shadow-sm">
            ➕ 새 채널
          </button>
        </Link>
      </div>

      {/* 로그아웃 */}
      <div className="p-4 border-t border-slate-200">
        <button className="w-full px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition text-sm">
          로그아웃
        </button>
      </div>
    </div>
  );
}
