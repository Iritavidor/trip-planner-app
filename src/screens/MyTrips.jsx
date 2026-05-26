import React, { useState } from 'react';
import { useTrip } from '../context/TripContext.jsx';

function fmt(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function dayCount(data) {
  return data?.days ? Object.keys(data.days).length : 0;
}

export default function MyTrips() {
  const { trips, tripsLoading, openTrip, createTrip, user, signOut } = useTrip();
  const [showForm, setShowForm] = useState(false);
  const [openingId, setOpeningId] = useState(null);

  const handleOpen = async (id) => {
    if (openingId) return;          // מונע לחיצות כפולות בזמן טעינה
    setOpeningId(id);
    await openTrip(id);
    // אם הפתיחה הצליחה האפליקציה תעבור למסך הטיול; אחרת נחזיר את הכרטיס למצב רגיל
    setOpeningId(null);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink">
      <header className="bg-[#E8F3E9] px-4 h-16 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[18px] font-bold">הטיולים שלי</div>
          {user && <div className="text-[12px] text-brand-ink/60 truncate" dir="ltr">{user.email}</div>}
        </div>
        <button onClick={signOut}
          className="shrink-0 h-9 px-3.5 rounded-full border border-brand-ink/40 text-[13px] font-semibold hover:bg-black/10 transition">
          התנתקות
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 pb-24 space-y-3">
        <button className="btn-primary w-full" onClick={() => setShowForm(true)}>
          + טיול חדש
        </button>

        {tripsLoading ? (
          <div className="text-center text-brand-muted py-16 text-sm">טוען טיולים…</div>
        ) : trips.length === 0 ? (
          <div className="text-center text-brand-muted/70 py-16">
            <div className="text-5xl mb-3">🧳</div>
            <div className="text-[14px]">עדיין אין לך טיולים. צרי את הראשון!</div>
          </div>
        ) : (
          trips.map(tr => {
            const meta = tr.data?.meta || {};
            const days = dayCount(tr.data);
            const isOpening = openingId === tr.id;
            return (
              <button key={tr.id} onClick={() => handleOpen(tr.id)}
                disabled={!!openingId}
                className="card w-full text-right active:opacity-70 hover:shadow-soft transition disabled:opacity-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗺️</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[16px] truncate flex items-center gap-2">
                      <span className="truncate">{tr.name || meta.title || 'טיול ללא שם'}</span>
                      {tr.shared && (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-lime/40 text-brand-olive">
                          {tr.permission === 'edit' ? 'משותף · עריכה' : 'משותף · צפייה'}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-brand-muted truncate">
                      {meta.country ? `${meta.country} · ` : ''}
                      {meta.dates?.start ? `${fmt(meta.dates.start)} – ${fmt(meta.dates.end)}` : 'ללא תאריכים'}
                      {days ? ` · ${days} ימים` : ''}
                    </div>
                  </div>
                  <span className="text-brand-muted">{isOpening ? 'פותח…' : '‹'}</span>
                </div>
              </button>
            );
          })
        )}
      </main>

      {showForm && <NewTripForm onClose={() => setShowForm(false)} onCreate={createTrip} />}
    </div>
  );
}

function NewTripForm({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [numDays, setNumDays] = useState(7);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onCreate({ title, country, startDate, numDays });
      // createTrip פותח את הטיול אוטומטית — האפליקציה תעבור למסך הטיול
    } catch {
      alert('יצירת הטיול נכשלה. נסי שוב.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit}
        className="bg-brand-surface w-full sm:max-w-sm rounded-t-card sm:rounded-card p-5 space-y-3">
        <div className="text-[17px] font-bold mb-1">טיול חדש</div>

        <div>
          <label className="label">שם הטיול</label>
          <input className="field" required value={title}
            onChange={e => setTitle(e.target.value)} placeholder="למשל: סין · קיץ 2026" />
        </div>
        <div>
          <label className="label">יעד</label>
          <input className="field" value={country}
            onChange={e => setCountry(e.target.value)} placeholder="למשל: סין" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">תאריך התחלה</label>
            <input type="date" className="field" value={startDate}
              onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="label">מספר ימים</label>
            <input type="number" min={1} max={90} className="field" value={numDays}
              onChange={e => setNumDays(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="btn bg-black/[0.05] text-brand-ink flex-1">ביטול</button>
          <button type="submit" disabled={busy}
            className="btn-primary flex-1 disabled:opacity-60">
            {busy ? 'יוצר…' : 'צור טיול'}
          </button>
        </div>
      </form>
    </div>
  );
}
