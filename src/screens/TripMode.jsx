import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useTrip } from '../context/TripContext.jsx';
import Header from '../components/Header.jsx';
import ActivitySheet from '../components/ActivitySheet.jsx';

const HE_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

// חלונות זמן – אותה פלטה, גוונים עדינים של ליים להבחנה
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

function todayDayNumber(days) {
  const today = new Date().toISOString().slice(0, 10);
  const found = Object.values(days).find(d => d.date === today);
  if (found) return found.dayNumber;
  const sorted = Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  if (today < sorted[0].date) return 1;
  return 20;
}

export default function TripMode() {
  const { state } = useTrip();
  const initial = useMemo(() => todayDayNumber(state.days), []);
  const [dayNum, setDayNum] = useState(initial);
  const [view, setView] = useState('day');
  const [activeActivity, setActiveActivity] = useState(null);
  const tabsRef = useRef(null);
  const day = state.days[dayNum];
  const daysList = Object.values(state.days).sort((a, b) => a.dayNumber - b.dayNumber);

  useEffect(() => {
    const el = tabsRef.current?.querySelector(`[data-day="${dayNum}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [dayNum]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-30">
        {/* שורה 1 — Header ראשי משותף */}
        <Header />

        <div className="bg-brand-surface border-b border-black/[0.04]">
          {/* Day tabs */}
          <div ref={tabsRef} className="flex gap-2 overflow-x-auto px-4 pt-3 scrollbar-none">
            {daysList.map(d => {
              const active = d.dayNumber === dayNum;
              return (
                <button key={d.dayNumber} data-day={d.dayNumber} onClick={() => { setDayNum(d.dayNumber); setView('day'); }}
                  className={`shrink-0 px-4 h-9 rounded-full text-[13px] font-bold transition ${
                    active ? 'bg-brand-lime text-brand-ink shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'bg-[#eae9d2] text-brand-muted'
                  }`}>
                  {fmtShort(d.date) || `יום ${d.dayNumber}`}
                </button>
              );
            })}
          </div>

          {/* View switch */}
          <div className="flex gap-2 px-4 py-2.5 text-[12px]">
            {[['day', 'היום'], ['flights', 'טיסות'], ['hotels', 'מלונות']].map(([id, label]) => (
              <button key={id} onClick={() => setView(id)}
                className={`px-5 h-9 rounded-full font-bold transition ${view === id ? 'bg-brand-lime text-brand-ink shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-brand-muted'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 pb-24">
        {view === 'day' && (
          <>
            {/* Day heading */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="text-[30px] font-extrabold leading-tight tracking-tight">{fmtLong(day.date)}</div>
                <div className="text-[13px] text-brand-muted mt-1">יום {dayNum} · {day.city || '—'}</div>
              </div>
              <button className="w-9 h-9 rounded-full hover:bg-black/[0.04] flex items-center justify-center text-lg leading-none pb-2 text-brand-muted">···</button>
            </div>
            <div className="flex gap-4 text-[13px] font-semibold text-brand-olive mb-6">
              <button>+ הוסף הערה</button>
              <button>בחר הכל</button>
            </div>

            <DayProgress date={day.date} />

            {/* Activities list */}
            {day.activities.length === 0 ? (
              <div className="text-center text-brand-muted/60 py-20">
                <div className="text-5xl mb-3">🗺️</div>
                <div className="text-[14px]">אין פעילויות ליום זה</div>
              </div>
            ) : (
              <ol className="space-y-4">
                {day.activities.map((a, i) => (
                  <ActivityCard key={a.id} a={a} index={i + 1} onClick={() => setActiveActivity(a)} />
                ))}
              </ol>
            )}

            {(day.restaurant || day.notes) && (
              <div className="mt-6 space-y-4">
                {day.restaurant && (
                  <div className="card">
                    <div className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-1">מסעדה</div>
                    <div className="text-[15px] font-semibold">🍽️ {day.restaurant}</div>
                  </div>
                )}
                {day.notes && (
                  <div className="card text-[14px] leading-relaxed whitespace-pre-wrap">
                    {day.notes}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {view === 'flights' && <FlightsView flights={state.flights} />}
        {view === 'hotels' && <HotelsView hotels={state.hotels} />}
      </main>

      {/* Day navigation arrows */}
      {view === 'day' && (
        <div className="fixed bottom-6 left-6 flex gap-2 z-20">
          <button disabled={dayNum >= 20} onClick={() => setDayNum(n => n + 1)}
            className="w-11 h-11 rounded-full bg-brand-surface shadow-soft flex items-center justify-center disabled:opacity-30 text-brand-ink">←</button>
          <button disabled={dayNum <= 1} onClick={() => setDayNum(n => n - 1)}
            className="w-11 h-11 rounded-full bg-brand-surface shadow-soft flex items-center justify-center disabled:opacity-30 text-brand-ink">→</button>
        </div>
      )}

      {activeActivity && <ActivitySheet activity={activeActivity} onClose={() => setActiveActivity(null)} />}
    </div>
  );
}

// שעות ברירת מחדל לחישוב התקדמות היום
const DAY_START_HOUR = 8;   // 08:00
const DAY_END_HOUR = 23;    // 23:00

function DayProgress({ date }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // מוצג רק ביום הנוכחי בפועל לפי תאריך
  const today = new Date();
  const isToday = date === today.toISOString().slice(0, 10);
  if (!isToday) return null;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const start = DAY_START_HOUR * 60;
  const end = DAY_END_HOUR * 60;
  let pct = ((minutesNow - start) / (end - start)) * 100;
  pct = Math.max(0, Math.min(100, pct));

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-[11px] font-semibold text-brand-muted mb-1.5">
        <span>{String(DAY_START_HOUR).padStart(2, '0')}:00</span>
        <span className="text-brand-olive">עכשיו {hh}:{mm} · {Math.round(pct)}%</span>
        <span>{String(DAY_END_HOUR).padStart(2, '0')}:00</span>
      </div>
      <div className="h-2.5 rounded-full bg-brand-ink/10 overflow-hidden">
        <div className="h-full bg-brand-lime rounded-full transition-all"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ActivityCard({ a, index, onClick }) {
  const slot = SLOT_STYLE[a.timeSlot] || SLOT_STYLE.morning;
  return (
    <li>
      <button onClick={onClick}
        className="w-full text-right bg-brand-surface rounded-card p-4 shadow-soft active:scale-[0.99] transition flex gap-3 items-start">
        {/* Numbered circle */}
        <div className="shrink-0 w-7 h-7 rounded-full bg-brand-ink text-white text-[13px] font-bold flex items-center justify-center mt-0.5">
          {index}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="inline-block max-w-full truncate bg-[#bbcb2f] text-brand-ink font-bold text-[15px] md:text-[16px] rounded-full px-3.5 py-1">{a.name || '(ללא שם)'}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`inline-flex items-center px-2.5 h-5 rounded-full text-[11px] font-bold ${slot.bg} ${slot.text}`}>
              {slot.label}
            </span>
            {a.duration && <span className="text-[11px] text-brand-muted">{a.duration}</span>}
            {a.ticketInfo?.hasTicket && (
              <span className="inline-flex items-center px-2.5 h-5 rounded-full text-[10px] font-bold bg-brand-lime/30 text-brand-olive">
                🎫 כרטיס
              </span>
            )}
          </div>
          {a.description && (
            <div className="text-[13px] text-brand-muted mt-2 line-clamp-2 leading-snug">{a.description}</div>
          )}
          <div className="flex items-center gap-3 mt-2.5 text-[12px]">
            {a.address && <span className="text-brand-muted truncate">🚶 {a.address}</span>}
            {(a.mapUrl || a.address) && (
              <a onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer"
                href={a.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(a.address)}`}
                className="text-brand-olive font-semibold shrink-0">הוראות הגעה</a>
            )}
          </div>
        </div>

        {/* Thumbnail */}
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
    </li>
  );
}

function FlightsView({ flights }) {
  if (!flights.length) return <Empty icon="✈️" text="אין טיסות" />;
  return (
    <div className="space-y-4">
      {flights.map(f => (
        <div key={f.id} className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 px-3 h-6 rounded-full text-[11px] font-bold bg-brand-lime/30 text-brand-olive">
              ✈️ {f.direction}
            </span>
            <span className="text-[12px] text-brand-muted">{f.date}</span>
          </div>
          <div className="text-[18px] font-bold mb-1">{f.airline} {f.flightNo}</div>
          <div className="text-[15px] text-brand-ink/80">{f.departureTime} → {f.arrivalTime}</div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-[12px]">
            {f.terminal && <Info label="טרמינל" value={f.terminal} />}
            {f.gate && <Info label="שער" value={f.gate} />}
            {f.seatNo && <Info label="מושב" value={f.seatNo} />}
          </div>
          {f.confirmationNo && <div className="text-[12px] text-brand-muted mt-2">אישור: <span className="font-bold text-brand-ink">{f.confirmationNo}</span></div>}
          {f.notes && <div className="text-[13px] text-brand-muted mt-3 pt-3 border-t border-black/[0.06] whitespace-pre-wrap">{f.notes}</div>}
        </div>
      ))}
    </div>
  );
}

function HotelsView({ hotels }) {
  if (!hotels.length) return <Empty icon="🏨" text="אין מלונות" />;
  return (
    <div className="space-y-4">
      {hotels.map(h => (
        <div key={h.id} className="card">
          <div className="flex gap-3 items-start">
            <div className="shrink-0 w-16 h-16 rounded-soft bg-brand-olive/10 text-2xl flex items-center justify-center">🏨</div>
            <div className="flex-1 min-w-0">
              <div className="text-[17px] font-bold truncate">{h.name}</div>
              <div className="text-[13px] text-brand-muted">{h.city}</div>
              <div className="text-[12px] text-brand-muted mt-1">{h.checkIn} – {h.checkOut}</div>
            </div>
          </div>
          {h.address && <div className="text-[13px] text-brand-muted mt-3">📍 {h.address}</div>}
          <div className="grid grid-cols-2 gap-2 mt-2 text-[12px]">
            {h.confirmationNo && <Info label="אישור" value={h.confirmationNo} />}
            {h.roomType && <Info label="חדר" value={h.roomType} />}
          </div>
          <div className="flex gap-2 mt-4">
            {h.phone && <a href={`tel:${h.phone}`} className="flex-1 h-11 rounded-full bg-brand-lime text-brand-ink font-bold text-[13px] flex items-center justify-center">📞 חייג</a>}
            {h.address && <a target="_blank" rel="noreferrer" href={`https://maps.google.com/?q=${encodeURIComponent(h.address)}`}
              className="flex-1 h-11 rounded-full border border-brand-ink/15 text-brand-ink font-semibold text-[13px] flex items-center justify-center">🗺️ מפה</a>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-brand-bg rounded-soft px-3 py-2">
      <div className="text-[10px] text-brand-muted font-medium">{label}</div>
      <div className="text-[13px] font-bold">{value}</div>
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div className="text-center text-brand-muted/60 py-20">
      <div className="text-5xl mb-3">{icon}</div>
      <div className="text-[14px]">{text}</div>
    </div>
  );
}
