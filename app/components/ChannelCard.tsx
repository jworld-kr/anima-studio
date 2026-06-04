'use client';

import { Channel } from '@/app/types';
import Link from 'next/link';
import { useState } from 'react';

interface ChannelCardProps {
  channel: Channel;
  onDelete: (id: string) => void;
  onEdit: (channel: Channel) => void;
}

export default function ChannelCard({ channel, onDelete, onEdit }: ChannelCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const createdDate = new Date(channel.createdAt);
  const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const dateLabel =
    daysAgo === 0 ? '오늘' : daysAgo === 1 ? '어제' : `${daysAgo}일 전`;

  const handleDelete = () => {
    if (confirm(`"${channel.name}" 채널을 삭제하시겠습니까?`)) {
      onDelete(channel.id);
      setShowMenu(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition border border-slate-200 overflow-hidden">
      {/* 썸네일 */}
      <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative">
        {channel.thumbnail && (
          <img
            src={channel.thumbnail}
            alt={channel.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-2 right-2">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/20 rounded transition"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                <button
                  onClick={() => {
                    onEdit(channel);
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-slate-700"
                >
                  편집
                </button>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-red-600"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 정보 */}
      <div className="p-4">
        <Link href={`/dashboard/${channel.id}`}>
          <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer mb-2">
            {channel.name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1 mb-3">
          {channel.activeCategories.map((cat) => (
            <span
              key={cat}
              className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium"
            >
              {cat}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-500">{dateLabel} 생성</p>
      </div>
    </div>
  );
}
