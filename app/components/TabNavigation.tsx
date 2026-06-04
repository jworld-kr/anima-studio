'use client';

interface TabNavigationProps {
  activeTab: 'worldbuilding' | 'thread' | 'history';
  onTabChange: (tab: 'worldbuilding' | 'thread' | 'history') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'worldbuilding', label: '세계관' },
    { id: 'thread', label: 'Thread' },
    { id: 'history', label: '히스토리' },
  ] as const;

  return (
    <div className="bg-white border-b border-slate-200 px-8">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-1 py-4 font-medium text-sm transition border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
