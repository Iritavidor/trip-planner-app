import React, { useEffect, useState } from 'react';
import { useTrip } from '../context/TripContext.jsx';
import { getActivityImage } from '../utils/activityImage.js';
import ImagePicker from './ImagePicker.jsx';

const TYPES = [['attraction', 'אטרקציה'], ['restaurant', 'מסעדה'], ['transport', 'תחבורה'], ['hotel', 'מלון'], ['free', 'זמן חופשי']];
const SLOTS = [['morning', 'בוקר'], ['noon', 'צהריים'], ['evening', 'ערב']];
const TYPE_EMOJI = { attraction: '🏛️', restaurant: '🍜', transport: '🚌', hotel: '🏨', free: '⭐' };

export default function ActivityEditSheet({ activity, dayNumber, onClose }) {
  const { dispatch } = useTrip();
  const [closing, setClosing] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const close = () => { setClosing(true); setTimeout(onClose, 280); };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = e => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, []);

  const up = patch => dispatch({ type: 'UPDATE_ACTIVITY', dayNumber, id: activity.id, patch });
  const upTicket = patch => up({ ticketInfo: { ...activity.ticketInfo, ...patch } });

  // טעינה אוטומטית מ-Unsplash — רק אם אין תמונה כלל ואין בחירה ידנית
  const fetchImage = async () => {
    if (!activity.name?.trim()) return;
    if (activity.image || activity.imageManual) return;
    setImgFailed(false);
    const url = await getActivityImage(activity.name, activity.type);
    up({ image: url });
  };

  // נבחרה תמונה ידנית (קובץ דחוס או URL) — גוברת על Unsplash
  const pickManual = (url) => {
    setImgFailed(false);
    up({ image: url, imageManual: true });
  };

  // חזרה ל-Unsplash — מבטל את הבחירה הידנית ומחפש מחדש לפי השם
  const useUnsplash = async () => {
    setImgFailed(false);
    up({ imageManual: false, image: '' });
    const url = await getActivityImage(activity.name, activity.type);
    up({ image: url, imageManual: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div onClick={close} className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`} />
      <div
        className="relative w-full max-h-[92vh] bg-[#fffde0] shadow-2xl flex flex-col"
        style={{
          borderRadius: '24px 24px 0 0',
          transform: closing ? 'translateY(100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease',
          animation: closing ? 'none' : 'sheetUp 0.3s ease'
        }}
      >
        <div className="pt-3 pb-2 flex justify-center"><div className="w-10 h-1.5 rounded-full bg-black/15" /></div>
        <div className="px-5 pb-2 flex items-center justify-between">
          <button onClick={close} className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">✕</button>
          <h3 className="font-bold text-[15px]">עריכת פעילות</h3>
          <button onClick={close} className="px-4 h-9 rounded-full bg-brand-lime text-brand-ink text-[13px] font-bold">שמור</button>
        </div>

        <div className="px-5 pb-8 overflow-y-auto space-y-3">
          <Field label="שם הפעילות">
            <input
              className="field font-bold"
              value={activity.name}
              onChange={e => up({ name: e.target.value })}
              onBlur={() => fetchImage(false)}
            />
          </Field>

          {/* Image preview + בקרת תמונה מאוחדת */}
          {activity.name?.trim() && (
            <div className="group relative" style={{ marginBottom: 4 }}>
              {activity.image && !imgFailed ? (
                <img
                  key={activity.image}
                  src={activity.image}
                  alt={activity.name}
                  width="400"
                  height="120"
                  loading="lazy"
                  onError={() => setImgFailed(true)}
                  style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, display: 'block' }}
                />
              ) : (
                <div
                  style={{ width: '100%', height: 120, borderRadius: 12 }}
                  className="flex items-center justify-center text-5xl bg-brand-olive/10"
                >
                  {TYPE_EMOJI[activity.type] || '⭐'}
                </div>
              )}
              {/* אייקון עדין: תמיד גלוי קטן במובייל, מופיע בריחוף בדסקטופ */}
              <button
                onClick={() => setPickerOpen(true)}
                title="שינוי תמונה"
                style={{ position: 'absolute', top: 8, left: 8 }}
                className="w-9 h-9 rounded-full bg-black/45 text-white text-[15px] flex items-center justify-center backdrop-blur-sm shadow-sm active:scale-95 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                📷
              </button>
            </div>
          )}
          <Field label="תיאור">
            <textarea rows={4} className="field" placeholder="מה לראות, מה לדעת, טיפים..." value={activity.description} onChange={e => up({ description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="סוג">
              <select className="field" value={activity.type} onChange={e => up({ type: e.target.value })}>
                {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="זמן ביום">
              <select className="field" value={activity.timeSlot} onChange={e => up({ timeSlot: e.target.value })}>
                {SLOTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="משך"><input className="field" value={activity.duration} onChange={e => up({ duration: e.target.value })} /></Field>
            <Field label="דמי כניסה"><input className="field" value={activity.entryFee} onChange={e => up({ entryFee: e.target.value })} /></Field>
          </div>
          <Field label="כתובת"><input className="field" value={activity.address} onChange={e => up({ address: e.target.value })} /></Field>
          <Field label="שעות פתיחה"><input className="field" value={activity.openingHours} onChange={e => up({ openingHours: e.target.value })} /></Field>
          <Field label="טיפים"><textarea rows={3} className="field" value={activity.tips} onChange={e => up({ tips: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="טלפון"><input className="field" value={activity.phone} onChange={e => up({ phone: e.target.value })} /></Field>
            <Field label="קישור למפה"><input className="field" value={activity.mapUrl} onChange={e => up({ mapUrl: e.target.value })} /></Field>
          </div>

          <div className="bg-brand-lime/15 rounded-soft p-3.5 space-y-2">
            <label className="flex items-center gap-2 text-[14px] font-bold">
              <input type="checkbox" checked={activity.ticketInfo?.hasTicket || false} onChange={e => upTicket({ hasTicket: e.target.checked })} />
              🎫 כרטיס מראש
            </label>
            {activity.ticketInfo?.hasTicket && (
              <div className="space-y-2">
                <Field label="מספר אישור"><input className="field" value={activity.ticketInfo.confirmationNo} onChange={e => upTicket({ confirmationNo: e.target.value })} /></Field>
                <Field label="קוד הזמנה"><input className="field" value={activity.ticketInfo.bookingRef} onChange={e => upTicket({ bookingRef: e.target.value })} /></Field>
                <Field label="הערות"><textarea rows={2} className="field" value={activity.ticketInfo.notes} onChange={e => upTicket({ notes: e.target.value })} /></Field>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (confirm('למחוק פעילות?')) {
                dispatch({ type: 'DELETE_ACTIVITY', dayNumber, id: activity.id });
                close();
              }
            }}
            className="w-full py-3 rounded-soft border border-brand-olive/30 text-brand-olive font-bold text-[14px]"
          >
            מחק פעילות
          </button>
        </div>
      </div>

      {pickerOpen && (
        <ImagePicker
          currentImage={activity.image}
          isManual={!!activity.imageManual}
          onPickManual={pickManual}
          onUseUnsplash={useUnsplash}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
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
