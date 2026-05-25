import React, { useEffect, useRef, useState } from 'react';
import { useTrip } from '../context/TripContext.jsx';

const FIELDS = [
  ['direction', 'כיוון (הלוך/חזור)'],
  ['date', 'תאריך', 'date'],
  ['departureTime', 'שעת המראה'],
  ['arrivalTime', 'שעת נחיתה'],
  ['flightNo', 'מספר טיסה'],
  ['airline', 'חברת תעופה'],
  ['terminal', 'טרמינל'],
  ['gate', 'שער'],
  ['confirmationNo', 'מספר אישור'],
  ['seatNo', 'מושב'],
];

export default function FlightsTab() {
  const { state, dispatch } = useTrip();
  const [openIds, setOpenIds] = useState([]);
  const knownIds = useRef(state.flights.map(f => f.id));

  // טיסות חדשות שנוספות נפתחות אוטומטית לעריכה
  useEffect(() => {
    const newIds = state.flights.map(f => f.id).filter(id => !knownIds.current.includes(id));
    if (newIds.length) setOpenIds(prev => [...prev, ...newIds]);
    knownIds.current = state.flights.map(f => f.id);
  }, [state.flights]);

  const toggle = id => setOpenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const addFlight = () => dispatch({ type: 'ADD_FLIGHT', flight: { direction: 'הלוך', date: '', departureTime: '', arrivalTime: '', flightNo: '', airline: '', terminal: '', gate: '', confirmationNo: '', seatNo: '', notes: '' } });

  return (
    <div className="space-y-3">
      <button className="btn-primary w-full" onClick={addFlight}>
        + טיסה חדשה
      </button>
      {state.flights.map(f => {
        const open = openIds.includes(f.id);
        return (
          <div key={f.id} className="card space-y-2">
            {!open ? (
              <button onClick={() => toggle(f.id)}
                className="w-full text-right flex items-center gap-3 active:opacity-70">
                <span className="text-xl">✈️</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] truncate">
                    {(f.direction || '') + ' · '}{f.airline} {f.flightNo || ''}
                  </div>
                  <div className="text-[12px] text-brand-muted">
                    {f.date || 'ללא תאריך'}{f.departureTime ? ` · ${f.departureTime}→${f.arrivalTime}` : ''}
                  </div>
                </div>
                <span className="text-brand-muted text-sm">▾</span>
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-red text-sm">פרטי טיסה</span>
                  <button onClick={() => toggle(f.id)} className="text-brand-muted text-sm">סגור ▴</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {FIELDS.map(([k, label, type]) => (
                    <div key={k} className={k === 'direction' ? 'col-span-2' : ''}>
                      <label className="label">{label}</label>
                      <input type={type || 'text'} className="field" value={f[k] || ''}
                        onChange={e => dispatch({ type: 'UPDATE_FLIGHT', id: f.id, patch: { [k]: e.target.value } })} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="label">הערות</label>
                  <textarea rows={2} className="field" value={f.notes || ''}
                    onChange={e => dispatch({ type: 'UPDATE_FLIGHT', id: f.id, patch: { notes: e.target.value } })} />
                </div>
                <button className="btn bg-brand-red/10 text-brand-red w-full text-sm"
                  onClick={() => confirm('למחוק טיסה?') && dispatch({ type: 'DELETE_FLIGHT', id: f.id })}>מחק</button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
