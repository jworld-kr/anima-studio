'use client';

import { Channel, WorldBuilding } from '@/app/types';
import { channelStorage } from '@/app/lib/storage';
import { generateSystemPrompt } from '@/app/lib/worldbuilding';
import WorldBuildingForm from '../WorldBuildingForm';
import { useState } from 'react';

interface WorldBuildingTabProps {
  channel: Channel;
}

export default function WorldBuildingTab({ channel }: WorldBuildingTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleUpdateWorldBuilding = (updated: WorldBuilding) => {
    channelStorage.updateChannel(channel.id, {
      worldBuilding: updated,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      setSaveMessage('저장되었습니다!');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const systemPrompt = generateSystemPrompt(channel.worldBuilding);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* 에디터 */}
      <div className="col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">세계관 설정</h2>
            <div className="flex gap-2 items-center">
              {saveMessage && (
                <span className="text-green-600 text-sm font-medium">{saveMessage}</span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition text-sm"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>

          <WorldBuildingForm
            worldBuilding={channel.worldBuilding}
            onChange={handleUpdateWorldBuilding}
          />
        </div>
      </div>

      {/* 미리보기 */}
      <div className="col-span-1">
        <div className="sticky top-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-slate-900 mb-4">시스템 프롬프트 미리보기</h3>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap overflow-y-auto max-h-[600px]">
            {systemPrompt}
          </div>
        </div>
      </div>
    </div>
  );
}
