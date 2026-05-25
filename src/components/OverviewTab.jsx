import React from 'react';
import { useTrip } from '../context/TripContext.jsx';

export default function OverviewTab() {
  const { state, dispatch } = useTrip();
  const m = state.meta;
  const upMeta = patch => dispatch({ type: 'UPDATE_META', patch });
  const upField = (field, value) => dispatch({ type: 'SET_FIELD', field, value });

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h2 className="font-bold text-brand-red">פרטי הטיול</h2>
        <div>
          <label className="label">שם הטיול</label>
          <input className="field" value={m.title} onChange={e => upMeta({ title: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">תאריך התחלה</label>
            <input type="date" className="field" value={m.dates.start} onChange={e => upMeta({ dates: { ...m.dates, start: e.target.value } })} />
          </div>
          <div>
            <label className="label">תאריך סיום</label>
            <input type="date" className="field" value={m.dates.end} onChange={e => upMeta({ dates: { ...m.dates, end: e.target.value } })} />
          </div>
        </div>
        <div>
          <label className="label">מטיילים</label>
          <input className="field" value={m.travelers} onChange={e => upMeta({ travelers: e.target.value })} />
        </div>
        <div>
          <label className="label">מדינה</label>
          <input className="field" value={m.country} onChange={e => upMeta({ country: e.target.value })} />
        </div>
      </div>

      <div className="card space-y-2">
        <h2 className="font-bold text-brand-red">תיאור</h2>
        <textarea rows={4} className="field" value={state.description} onChange={e => upField('description', e.target.value)} />
      </div>

      <div className="card space-y-2">
        <h2 className="font-bold text-brand-red">תקציב</h2>
        <textarea rows={3} className="field" value={state.budget} onChange={e => upField('budget', e.target.value)} />
      </div>

      <div className="card space-y-2">
        <h2 className="font-bold text-brand-red">אנשי קשר לחירום</h2>
        <textarea rows={4} className="field" value={state.emergencyContacts} onChange={e => upField('emergencyContacts', e.target.value)} />
      </div>

      <div className="card space-y-2">
        <h2 className="font-bold text-brand-red">הערות כלליות</h2>
        <textarea rows={4} className="field" value={state.generalNotes} onChange={e => upField('generalNotes', e.target.value)} />
      </div>
    </div>
  );
}
