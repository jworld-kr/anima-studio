'use client';

import { Channel } from '@/app/types';
import Sidebar from './Sidebar';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  channels: Channel[];
  channelId: string;
  children: ReactNode;
}

export default function DashboardLayout({
  channels,
  channelId,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();

  const handleChannelSelect = (id: string) => {
    router.push(`/dashboard/${id}`);
  };

  const currentChannel = channels.find((ch) => ch.id === channelId);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* 사이드바 */}
      <Sidebar channels={channels} onChannelSelect={handleChannelSelect} />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {currentChannel?.name || '채널'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {currentChannel?.activeCategories.join(' • ') || ''}
            </p>
          </div>
        </header>

        {/* 콘텐츠 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
