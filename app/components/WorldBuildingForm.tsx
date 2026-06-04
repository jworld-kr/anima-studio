'use client';

import { WorldBuilding } from '@/app/types';
import { useState } from 'react';

interface WorldBuildingFormProps {
  worldBuilding: WorldBuilding;
  onChange: (updated: WorldBuilding) => void;
}

type SectionType =
  | 'basic'
  | 'personality'
  | 'world'
  | 'contentDirection'
  | 'targetAudience'
  | 'tone'
  | 'examples'
  | 'forbidden';

export default function WorldBuildingForm({
  worldBuilding,
  onChange,
}: WorldBuildingFormProps) {
  const [activeSection, setActiveSection] = useState<SectionType>('basic');
  const [tempExample, setTempExample] = useState({ title: '', content: '' });

  const updateBasic = (field: string, value: any) => {
    onChange({
      ...worldBuilding,
      basic: { ...worldBuilding.basic, [field]: value },
    });
  };

  const updatePersonality = (field: string, value: any) => {
    onChange({
      ...worldBuilding,
      personality: { ...worldBuilding.personality, [field]: value },
    });
  };

  const updateWorld = (field: string, value: any) => {
    onChange({
      ...worldBuilding,
      world: { ...worldBuilding.world, [field]: value },
    });
  };

  const updateContentDirection = (field: string, value: any) => {
    onChange({
      ...worldBuilding,
      contentDirection: { ...worldBuilding.contentDirection, [field]: value },
    });
  };

  const updateTargetAudience = (field: string, value: any) => {
    onChange({
      ...worldBuilding,
      targetAudience: { ...worldBuilding.targetAudience, [field]: value },
    });
  };

  const updateTone = (field: string, value: number) => {
    onChange({
      ...worldBuilding,
      tone: { ...worldBuilding.tone, [field]: value },
    });
  };

  const updateForbidden = (value: string) => {
    onChange({
      ...worldBuilding,
      forbiddenThings: value,
    });
  };

  const addExample = () => {
    if (tempExample.content.trim()) {
      onChange({
        ...worldBuilding,
        examples: [
          ...worldBuilding.examples,
          { title: tempExample.title, content: tempExample.content },
        ],
      });
      setTempExample({ title: '', content: '' });
    }
  };

  const removeExample = (idx: number) => {
    onChange({
      ...worldBuilding,
      examples: worldBuilding.examples.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* 좌측 네비 */}
      <div className="col-span-1">
        <div className="sticky top-6 space-y-1">
          {[
            { id: 'basic' as SectionType, label: '기본 정보' },
            { id: 'personality' as SectionType, label: '성격 & 말투' },
            { id: 'world' as SectionType, label: '세계관 & 배경' },
            { id: 'contentDirection' as SectionType, label: '콘텐츠 방향' },
            { id: 'targetAudience' as SectionType, label: '타겟 독자' },
            { id: 'tone' as SectionType, label: '톤 설정' },
            { id: 'examples' as SectionType, label: '예시 게시물' },
            { id: 'forbidden' as SectionType, label: '금지 사항' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white font-medium'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* 우측 콘텐츠 */}
      <div className="col-span-3">
        <div className="space-y-6">
          {/* 기본 정보 */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  페르소나 이름 *
                </label>
                <input
                  type="text"
                  value={worldBuilding.basic.name}
                  onChange={(e) => updateBasic('name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  나이
                </label>
                <input
                  type="number"
                  value={worldBuilding.basic.age || ''}
                  onChange={(e) =>
                    updateBasic('age', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  직업
                </label>
                <input
                  type="text"
                  value={worldBuilding.basic.job}
                  onChange={(e) => updateBasic('job', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  외형 묘사
                </label>
                <textarea
                  value={worldBuilding.basic.appearance || ''}
                  onChange={(e) => updateBasic('appearance', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  한줄 설명
                </label>
                <input
                  type="text"
                  value={worldBuilding.basic.oneline || ''}
                  onChange={(e) => updateBasic('oneline', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 성격 & 말투 */}
          {activeSection === 'personality' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  주요 성격
                </label>
                <textarea
                  value={worldBuilding.personality.traits || ''}
                  onChange={(e) => updatePersonality('traits', e.target.value)}
                  rows={3}
                  placeholder="예: 친근함, 자조적, 공감형..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  자주 쓰는 표현 (쉼표 분리)
                </label>
                <textarea
                  value={
                    (worldBuilding.personality.expressions || []).join('\n') || ''
                  }
                  onChange={(e) =>
                    updatePersonality(
                      'expressions',
                      e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter((s) => s)
                    )
                  }
                  rows={3}
                  placeholder="아 진짜&#10;이게 맞나&#10;헉..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  말투 특징
                </label>
                <textarea
                  value={worldBuilding.personality.speechPattern || ''}
                  onChange={(e) => updatePersonality('speechPattern', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  금지어/표현 (쉼표 분리)
                </label>
                <textarea
                  value={
                    (worldBuilding.personality.forbiddenWords || []).join('\n') || ''
                  }
                  onChange={(e) =>
                    updatePersonality(
                      'forbiddenWords',
                      e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter((s) => s)
                    )
                  }
                  rows={2}
                  placeholder="전문 용어&#10;복잡한 단어"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 세계관 & 배경 */}
          {activeSection === 'world' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  배경 설정
                </label>
                <textarea
                  value={worldBuilding.world.background || ''}
                  onChange={(e) => updateWorld('background', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  관심사 (줄 단위)
                </label>
                <textarea
                  value={(worldBuilding.world.interests || []).join('\n') || ''}
                  onChange={(e) =>
                    updateWorld(
                      'interests',
                      e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter((s) => s)
                    )
                  }
                  rows={2}
                  placeholder="자영업 경영&#10;원가계산"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  가치관
                </label>
                <textarea
                  value={worldBuilding.world.values || ''}
                  onChange={(e) => updateWorld('values', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  일상 루틴
                </label>
                <textarea
                  value={worldBuilding.world.dailyRoutine || ''}
                  onChange={(e) => updateWorld('dailyRoutine', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 콘텐츠 방향 */}
          {activeSection === 'contentDirection' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  주요 주제 (줄 단위)
                </label>
                <textarea
                  value={
                    (worldBuilding.contentDirection.mainTopics || []).join('\n') || ''
                  }
                  onChange={(e) =>
                    updateContentDirection(
                      'mainTopics',
                      e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter((s) => s)
                    )
                  }
                  rows={2}
                  placeholder="원가계산&#10;자영업 경영"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  판매/홍보 대상
                </label>
                <input
                  type="text"
                  value={worldBuilding.contentDirection.sellWhat || ''}
                  onChange={(e) => updateContentDirection('sellWhat', e.target.value)}
                  placeholder="예: 고독이 원가계산기"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  메시지
                </label>
                <textarea
                  value={worldBuilding.contentDirection.message || ''}
                  onChange={(e) => updateContentDirection('message', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  금기 주제 (줄 단위)
                </label>
                <textarea
                  value={
                    (worldBuilding.contentDirection.forbiddenTopics || []).join('\n') ||
                    ''
                  }
                  onChange={(e) =>
                    updateContentDirection(
                      'forbiddenTopics',
                      e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter((s) => s)
                    )
                  }
                  rows={2}
                  placeholder="정치&#10;종교"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 타겟 독자 */}
          {activeSection === 'targetAudience' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  타겟 독자 설명
                </label>
                <input
                  type="text"
                  value={worldBuilding.targetAudience.description || ''}
                  onChange={(e) => updateTargetAudience('description', e.target.value)}
                  placeholder="예: 소규모 자영업자, 카페/식당 사장님"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  나이대
                </label>
                <select
                  value={worldBuilding.targetAudience.ageGroup || ''}
                  onChange={(e) => updateTargetAudience('ageGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택</option>
                  <option value="10s">10대</option>
                  <option value="20s">20대</option>
                  <option value="30s">30대</option>
                  <option value="40s">40대</option>
                  <option value="50s+">50대 이상</option>
                  <option value="all">무관</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  관심사
                </label>
                <textarea
                  value={worldBuilding.targetAudience.interests || ''}
                  onChange={(e) => updateTargetAudience('interests', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  톤 팁
                </label>
                <textarea
                  value={worldBuilding.targetAudience.toneTip || ''}
                  onChange={(e) => updateTargetAudience('toneTip', e.target.value)}
                  rows={2}
                  placeholder="더 친근하게? 더 전문적으로?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 톤 설정 */}
          {activeSection === 'tone' && (
            <div className="space-y-6">
              {[
                { key: 'seriousness', label: '진지함 ← → 유머' },
                { key: 'professionalism', label: '전문적 ← → 친근함' },
                { key: 'formality', label: '격식 ← → 캐주얼' },
                { key: 'depth', label: '심도 ← → 가벼움' },
              ].map((slider) => (
                <div key={slider.key}>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      {slider.label}
                    </label>
                    <span className="text-sm font-bold text-blue-600">
                      {worldBuilding.tone[slider.key as keyof typeof worldBuilding.tone]}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={
                      worldBuilding.tone[slider.key as keyof typeof worldBuilding.tone]
                    }
                    onChange={(e) =>
                      updateTone(slider.key, parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 예시 게시물 */}
          {activeSection === 'examples' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  예시 제목 (선택)
                </label>
                <input
                  type="text"
                  value={tempExample.title}
                  onChange={(e) => setTempExample({ ...tempExample, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  예시 본문
                </label>
                <textarea
                  value={tempExample.content}
                  onChange={(e) =>
                    setTempExample({ ...tempExample, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={addExample}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + 예시 추가
              </button>

              {worldBuilding.examples.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-slate-700">등록된 예시</h4>
                  {worldBuilding.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-100 rounded-lg text-sm"
                    >
                      {ex.title && <strong>{ex.title}</strong>}
                      <p className="text-slate-700 mt-1">{ex.content}</p>
                      <button
                        onClick={() => removeExample(idx)}
                        className="text-red-600 hover:text-red-700 text-xs mt-2"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 금지 사항 */}
          {activeSection === 'forbidden' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  절대 피해야 할 것들
                </label>
                <textarea
                  value={worldBuilding.forbiddenThings || ''}
                  onChange={(e) => updateForbidden(e.target.value)}
                  rows={4}
                  placeholder="이 페르소나로서 절대 하지 말아야 할 것들..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
