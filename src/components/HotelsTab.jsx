import React, { useEffect, useRef, useState } from 'react';
import { useTrip } from '../context/TripContext.jsx';

const FIELDS = [
  ['name', 'שם המלון'],
  ['city', 'עיר'],
  ['checkIn', 'צ׳ק אין', 'date'],
  ['checkOut', 'צ׳ק אאוט', 'date'],
  ['address', 'כתובת'],
  ['phone', 'טלפון'],
  ['confirmationNo', 'מספר אישור'],
  ['roomType', 'סוג חדר'],
];

export default function HotelsTab() {
  const { state, dispatch } = useTrip();
  const [openIds, setOpenIds] = useState([]);
  const knownIds = useRef(state.hotels.map(h => h.id));

  // מלונות חדשים שנוספים נפתחים אוטומטית לעריכה
  useEffect(() => {
    const newIds = state.hotels.map(h => h.id).filter(id => !knownIds.current.includes(id));
    if (newIds.length) setOpenIds(prev => [...prev, ...newIds]);
    knownIds.current = state.hotels.map(h => h.id);
  }, [state.hotels]);

  const toggle = id => setOpenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const addHotel = () => dispatch({ type: 'ADD_HOTEL', hotel: { name: '', city: '', checkIn: '', checkOut: '', address: '', phone: '', confirmationNo: '', roomType: '', notes: '', document: null, documentName: '' } });

  const uploadDoc = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => dispatch({ type: 'UPDATE_HOTEL', id, patch: { document: e.target.result, documentName: file.name } });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <button className="btn-primary w-full" onClick={addHotel}>
        + מלון חדש
      </button>
      {state.hotels.map(h => {
        const open = openIds.includes(h.id);
        return (
          <div key={h.id} className="card space-y-2">
            {!open ? (
              <button onClick={() => toggle(h.id)}
                className="w-full text-right flex items-center gap-3 active:opacity-70">
                <span className="text-xl">🏨</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] truncate">{h.name || 'מלון ללא שם'}</div>
                  <div className="text-[12px] text-brand-muted">
                    {h.checkIn || '—'} – {h.checkOut || '—'}{h.document ? ' · 📎 מסמך' : ''}
                  </div>
                </div>
                <span className="text-brand-muted text-sm">▾</span>
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-red text-sm">פרטי מלון</span>
                  <button onClick={() => toggle(h.id)} className="text-brand-muted text-sm">סגור ▴</button>
                </div>
                {FIELDS.map(([k, label, type]) => (
                  <div key={k}>
                    <label className="label">{label}</label>
                    <input type={type || 'text'} className="field" value={h[k] || ''}
                      onChange={e => dispatch({ type: 'UPDATE_HOTEL', id: h.id, patch: { [k]: e.target.value } })} />
                  </div>
                ))}
                <div>
                  <label className="label">הערות</label>
                  <textarea rows={2} className="field" value={h.notes || ''}
                    onChange={e => dispatch({ type: 'UPDATE_HOTEL', id: h.id, patch: { notes: e.target.value } })} />
                </div>
                <div>
                  <label className="label">מסמך מצורף (PDF / תמונה)</label>
                  {h.document ? (
                    <div className="flex items-center gap-2 bg-brand-bg rounded-soft px-3 py-2">
                      <a href={h.document} target="_blank" rel="noreferrer" download={h.documentName || 'document'}
                        className="flex-1 text-[13px] font-semibold text-brand-red truncate">📎 {h.documentName || 'הצג מסמך'}</a>
                      <button className="text-brand-muted text-sm"
                        onClick={() => dispatch({ type: 'UPDATE_HOTEL', id: h.id, patch: { document: null, documentName: '' } })}>הסר</button>
                    </div>
                  ) : (
                    <input type="file" accept="application/pdf,image/*" className="field"
                      onChange={e => uploadDoc(h.id, e.target.files?.[0])} />
                  )}
                </div>
                <button className="btn bg-brand-red/10 text-brand-red w-full text-sm"
                  onClick={() => confirm('למחוק מלון?') && dispatch({ type: 'DELETE_HOTEL', id: h.id })}>מחק</button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
