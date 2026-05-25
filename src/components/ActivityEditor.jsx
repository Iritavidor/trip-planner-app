import React, { useState } from 'react';
import { useTrip } from '../context/TripContext.jsx';

const TYPES = [
  ['attraction', 'אטרקציה'],
  ['restaurant', 'מסעדה'],
  ['transport', 'תחבורה'],
  ['hotel', 'מלון'],
  ['free', 'זמן חופשי']
];
const SLOTS = [['morning', 'בוקר'], ['noon', 'צהריים'], ['evening', 'ערב']];

export default function ActivityEditor({ activity, dayNumber }) {
  const { dispatch } = useTrip();
  const [open, setOpen] = useState(false);
  const up = patch => dispatch({ type: 'UPDATE_ACTIVITY', dayNumber, id: activity.id, patch });
  const upTicket = patch => up({ ticketInfo: { ...activity.ticketInfo, ...patch } });

  return (
    <div className="card space-y-2">
      <div className="flex items-center gap-2">
        <input className="field flex-1 font-bold" placeholder="שם פעילות" value={activity.name} onChange={e => up({ name: e.target.value })} />
        <button className="btn-ghost text-xs" onClick={() => setOpen(o => !o)}>{open ? 'סגור' : 'ערוך'}</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select className="field" value={activity.type} onChange={e => up({ type: e.target.value })}>
          {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="field" value={activity.timeSlot} onChange={e => up({ timeSlot: e.target.value })}>
          {SLOTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {open && (
        <div className="space-y-2 pt-2 border-t border-brand-dark/10">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">משך</label><input className="field" value={activity.duration} onChange={e => up({ duration: e.target.value })} /></div>
            <div><label className="label">דמי כניסה</label><input className="field" value={activity.entryFee} onChange={e => up({ entryFee: e.target.value })} /></div>
          </div>
          <div><label className="label">כתובת</label><input className="field" value={activity.address} onChange={e => up({ address: e.target.value })} /></div>
          <div><label className="label">שעות פתיחה</label><input className="field" value={activity.openingHours} onChange={e => up({ openingHours: e.target.value })} /></div>
          <div><label className="label">תיאור</label><textarea rows={2} className="field" value={activity.description} onChange={e => up({ description: e.target.value })} /></div>
          <div><label className="label">טיפים</label><textarea rows={2} className="field" value={activity.tips} onChange={e => up({ tips: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">טלפון</label><input className="field" value={activity.phone} onChange={e => up({ phone: e.target.value })} /></div>
            <div><label className="label">קישור למפה</label><input className="field" value={activity.mapUrl} onChange={e => up({ mapUrl: e.target.value })} /></div>
          </div>

          <div className="bg-brand-gold/10 rounded-lg p-2 space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={activity.ticketInfo?.hasTicket || false} onChange={e => upTicket({ hasTicket: e.target.checked })} />
              כרטיס מראש
            </label>
            {activity.ticketInfo?.hasTicket && (
              <div className="space-y-2">
                <div><label className="label">מספר אישור</label><input className="field" value={activity.ticketInfo.confirmationNo} onChange={e => upTicket({ confirmationNo: e.target.value })} /></div>
                <div><label className="label">קוד הזמנה</label><input className="field" value={activity.ticketInfo.bookingRef} onChange={e => upTicket({ bookingRef: e.target.value })} /></div>
                <div><label className="label">הערות כרטיס</label><textarea rows={2} className="field" value={activity.ticketInfo.notes} onChange={e => upTicket({ notes: e.target.value })} /></div>
              </div>
            )}
          </div>

          <button className="btn bg-brand-red/10 text-brand-red w-full text-sm"
            onClick={() => confirm('למחוק פעילות?') && dispatch({ type: 'DELETE_ACTIVITY', dayNumber, id: activity.id })}>
            מחק פעילות
          </button>
        </div>
      )}
    </div>
  );
}
