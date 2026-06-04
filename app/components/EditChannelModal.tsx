'use client';

import { Channel } from '@/app/types';
import { useState } from 'react';

interface EditChannelModalProps {
  channel: Channel;
  onClose: () => void;
  onSave: (name: string, thumbnail?: string) => void;
}

export default function EditChannelModal({
  channel,
  onClose,
  onSave,
}: EditChannelModalProps) {
  const [name, setName] = useState(channel.name);
  const [thumbnail, setThumbnail] = useState(channel.thumbnail || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setThumbnail(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('채널명을 입력해주세요.');
      return;
    }
    onSave(name, thumbnail);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">채널 편집</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              채널명
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              썸네일
            </label>
            {thumbnail && (
              <img
                src={thumbnail}
                alt="preview"
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
