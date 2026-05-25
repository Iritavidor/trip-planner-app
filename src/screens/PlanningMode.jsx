import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import OverviewTab from '../components/OverviewTab.jsx';
import FlightsTab from '../components/FlightsTab.jsx';
import HotelsTab from '../components/HotelsTab.jsx';
import DaysTab from '../components/DaysTab.jsx';
import ListTab from '../components/ListTab.jsx';

const TABS = [
  { id: 'overview', label: 'סקירה' },
  { id: 'days', label: 'ימים' },
  { id: 'flights', label: 'טיסות' },
  { id: 'hotels', label: 'מלונות' },
  { id: 'packing', label: 'הכנות' }
];

export default function PlanningMode() {
  const [tab, setTab] = useState('days');

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink">
      <header className="sticky top-0 z-30">
        {/* שורה 1 — Header ראשי משותף */}
        <Header />

        {/* שורה 2 — טאבים ראשיים */}
        <div className="bg-brand-surface border-b border-black/[0.04]">
          <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
            {TABS.map(t => {
              const active = t.id === tab;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`shrink-0 px-5 h-9 rounded-full text-[13px] font-bold transition ${
                    active ? 'bg-brand-lime text-brand-ink shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-brand-muted hover:bg-black/[0.04]'
                  }`}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 pb-12">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'flights' && <FlightsTab />}
        {tab === 'hotels' && <HotelsTab />}
        {tab === 'days' && <DaysTab />}
        {tab === 'packing' && (
          <div className="space-y-4">
            <ListTab listKey="packing" title="רשימת אריזה" />
            <div className="px-1 pt-2">
              <h2 className="font-bold text-brand-ink text-[20px]">משימות לפני הטיול</h2>
            </div>
            <ListTab listKey="todosMonth" title="חודש לפני" />
            <ListTab listKey="todosTwoWeeks" title="שבועיים לפני" />
            <ListTab listKey="todosWeek" title="שבוע לפני" />
            <ListTab listKey="todosDay" title="יום לפני" />
          </div>
        )}
      </main>
    </div>
  );
}
