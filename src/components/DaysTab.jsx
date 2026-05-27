import React, { useState, useRef, useEffect } from 'react';
import { useTrip } from '../context/TripContext.jsx';
import ActivitySheet from './ActivitySheet.jsx';
import ActivityEditSheet from './ActivityEditSheet.jsx';

const HE_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const SLOT_STYLE = {
  morning: { bg: 'bg-[#eae9d2]', text: 'text-brand-ink', label: 'בוקר' },
  noon: { bg: 'bg-[#eae9d2]', text: 'text-brand-ink', label: 'צהריים' },
  evening: { bg: 'bg-[#eae9d2]', text: 'text-brand-ink', label: 'ערב' }
};
const TYPE_ICON = { attraction: '📍', restaurant: '🍜', transport: '🚄', hotel: '🏨', free: '✨' };

function fmtShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${HE_DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}
function fmtLong(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `יום ${HE_DAYS[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
}

export default function DaysTab() {
  const { state, dispatch } = useTrip();
  const [dayNum, setDayNum] = useState(1);
  const [previewId, setPreviewId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDay, setEditDay] = useState(false);
  const tabsRef = useRef(null);
  const day = state.days[dayNum];
  const daysList = Object.values(state.days).sort((a, b) => a.dayNumber - b.dayNumber);

  useEffect(() => {
    const el = tabsRef.current?.querySelector(`[data-day="${dayNum}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [dayNum]);

  return (
    <div>
      <div ref={tabsRef} className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-3 scrollbar-none">
        {daysList.map(d => {
          const active = d.dayNumber === dayNum;
          return (
            <button key={d.dayNumber} data-day={d.dayNumber} onClick={() => setDayNum(d.dayNumber)}
              className={`shrink-0 px-4 h-9 rounded-full text-[13px] font-bold transition ${
                active ? 'bg-brand-lime text-brand-ink shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'bg-[#eae9d2] text-brand-muted'
              }`}>
              {fmtShort(d.date)}
            </button>
          );
        })}
      </div>

      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-[30px] font-extrabold leading-tight tracking-tight">{fmtLong(day.date)}</div>
          <div className="text-[13px] text-brand-muted mt-1">יום {dayNum} · {day.city || 'ללא עיר'}</div>
        </div>
        <button onClick={() => setEditDay(v => !v)}
          className="px-4 h-9 rounded-full bg-brand-surface border border-black/[0.05] text-[13px] font-semibold">
          {editDay ? 'סגור' : '✏️ פרטי יום'}
        </button>
      </div>

      {editDay && (
        <div className="card mb-4 space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="תאריך">
              <input type="date" className="field" value={day.date}
                onChange={e => dispatch({ type: 'UPDATE_DAY', dayNumber: dayNum, patch: { date: e.target.value } })} />
            </Field>
            <Field label="עיר">
              <input className="field" value={day.city}
                onChange={e => dispatch({ type: 'UPDATE_DAY', dayNumber: dayNum, patch: { city: e.target.value } })} />
            </Field>
          </div>
          <Field label="מסעדה ליום">
            <textarea rows={3} className="field" value={day.restaurant}
              onChange={e => dispatch({ type: 'UPDATE_DAY', dayNumber: dayNum, patch: { restaurant: e.target.value } })} />
          </Field>
          <Field label="הערות ליום">
            <textarea rows={3} className="field" value={day.notes}
              onChange={e => dispatch({ type: 'UPDATE_DAY', dayNumber: dayNum, patch: { notes: e.target.value } })} />
          </Field>
        </div>
      )}

      <div className="mt-6">
        {day.activities.length === 0 ? (
          <div className="text-center text-brand-muted/60 py-12">
            <div className="text-5xl mb-3">🗺️</div>
            <div className="text-[14px]">אין פעילויות ליום זה</div>
          </div>
        ) : (
          <ol className="space-y-4">
            {day.activities.map((a, i) => (
              <ActivityCard
                key={a.id}
                a={a}
                index={i + 1}
                onPreview={() => setPreviewId(a.id)}
                onEdit={() => setEditingId(a.id)}
                onDelete={() => confirm('למחוק פעילות?') && dispatch({ type: 'DELETE_ACTIVITY', dayNumber: dayNum, id: a.id })}
              />
            ))}
          </ol>
        )}

        <button
          onClick={() => dispatch({ type: 'ADD_ACTIVITY', dayNumber: dayNum, activity: { name: 'פעילות חדשה' } })}
          className="w-full mt-4 py-3.5 rounded-card border-2 border-dashed border-brand-olive/30 text-brand-olive font-bold text-[14px] active:scale-[0.99]"
        >
          + הוסף פעילות
        </button>

        {(day.restaurant || day.notes) && (
          <div className="mt-6 space-y-4">
            {day.restaurant && (
              <div className="card">
                <div className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-1">מסעדה</div>
                <div className="text-[15px] font-semibold" style={{ whiteSpace: 'pre-wrap' }}>🍽️ {day.restaurant}</div>
              </div>
            )}
            {day.notes && (
              <div className="card text-[14px] leading-relaxed whitespace-pre-wrap">
                {day.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {previewId && day.activities.find(a => a.id === previewId) && (
        <ActivitySheet activity={day.activities.find(a => a.id === previewId)} onClose={() => setPreviewId(null)} />
      )}
      {editingId && day.activities.find(a => a.id === editingId) && (
        <ActivityEditSheet activity={day.activities.find(a => a.id === editingId)} dayNumber={dayNum} onClose={() => setEditingId(null)} />
      )}
    </div>
  );
}

function ActivityCard({ a, index, onPreview, onEdit, onDelete }) {
  const slot = SLOT_STYLE[a.timeSlot] || SLOT_STYLE.morning;
  return (
    <li className="bg-brand-surface rounded-card shadow-soft overflow-hidden">
      <button onClick={onPreview} className="w-full text-right p-4 flex gap-3 items-start active:bg-black/[0.02]">
        <div className="shrink-0 w-7 h-7 rounded-full bg-brand-ink text-white text-[13px] font-bold flex items-center justify-center mt-0.5">
          {index}
        </div>
        <div className="flex-1 min-w-0">
          <div className="inline-block max-w-full truncate bg-[#bbcb2f] text-brand-ink font-bold text-[15px] md:text-[16px] rounded-full px-3.5 py-1">{a.name || '(ללא שם)'}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`inline-flex items-center px-2.5 h-5 rounded-full text-[11px] font-bold ${slot.bg} ${slot.text}`}>
              {slot.label}
            </span>
            {a.duration && <span className="text-[11px] text-brand-muted">{a.duration}</span>}
            {a.ticketInfo?.hasTicket && (
              <span className="inline-flex items-center px-2.5 h-5 rounded-full text-[10px] font-bold bg-brand-lime/30 text-brand-olive">
                🎫
              </span>
            )}
          </div>
          {a.description && (
            <div className="text-[13px] text-brand-muted mt-2 line-clamp-2 leading-snug">{a.description}</div>
          )}
        </div>
        {a.image ? (
          <img
            src={a.image}
            alt=""
            width="72"
            height="72"
            loading="lazy"
            onError={e => { e.currentTarget.style.display = 'none'; }}
            style={{ width: 72, height: 72, flexShrink: 0, objectFit: 'cover', borderRadius: 16 }}
          />
        ) : (
          <div
            style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 16 }}
            className="bg-brand-olive/10 flex items-center justify-center text-3xl"
          >
            {TYPE_ICON[a.type] || '📍'}
          </div>
        )}
      </button>
      <div className="flex border-t border-black/[0.06] text-[12px] font-semibold">
        <button onClick={onEdit} className="flex-1 py-3 text-brand-olive hover:bg-black/[0.02]">✏️ ערוך</button>
        <div className="w-px bg-black/[0.06]" />
        <button onClick={onDelete} className="flex-1 py-3 text-brand-muted hover:bg-black/[0.02]">🗑 מחק</button>
      </div>
    </li>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[12px] text-brand-muted font-medium mb-1">{label}</div>
      {children}
    </div>
  );
}
