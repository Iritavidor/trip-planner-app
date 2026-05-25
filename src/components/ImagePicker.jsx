import React, { useEffect, useRef, useState } from 'react';
import { compressImage } from '../utils/compressImage.js';

// ממשק מאוחד לבחירת תמונה לפעילות: העלאת קובץ / הדבקת URL / חזרה ל-Unsplash.
// props:
//   currentImage   - ה-URL/base64 המוצג כעת
//   isManual       - האם התמונה הנוכחית היא בחירה ידנית (גוברת על Unsplash)
//   onPickManual(url) - נבחרה תמונה ידנית (קובץ דחוס או URL)
//   onUseUnsplash()   - חזרה לחיפוש אוטומטי (מחיקת הבחירה הידנית)
//   onClose()
export default function ImagePicker({ currentImage, isManual, onPickManual, onUseUnsplash, onClose }) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [preview, setPreview] = useState(null);   // תצוגה מקדימה לפני שמירה
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const onKey = e => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, []);

  const close = () => { setClosing(true); setTimeout(onClose, 300); };

  const handleFile = async (file) => {
    if (!file) return;
    setError(''); setBusy(true);
    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
    } catch (e) {
      setError(e.message || 'שגיאה בעיבוד התמונה');
    } finally {
      setBusy(false);
    }
  };

  const previewUrl = (u) => { setError(''); setPreview(u.trim() || null); };

  const confirm = () => {
    if (!preview) return;
    onPickManual(preview);
    close();
  };

  const backToUnsplash = () => { onUseUnsplash(); close(); };

  const shown = preview || currentImage;
  const translateY = closing ? '100%' : mounted ? '0' : '100%';

  return (
    <div className="fixed inset-0 z-[60] flex items-end">
      <div onClick={close}
        style={{ background: 'rgba(0,0,0,0.45)', opacity: closing || !mounted ? 0 : 1, transition: 'opacity 0.3s ease' }}
        className="absolute inset-0" />
      <div
        className="relative w-full max-h-[92vh] bg-[#fffde0] shadow-2xl flex flex-col"
        style={{ borderRadius: '24px 24px 0 0', transform: `translateY(${translateY})`, transition: 'transform 0.3s ease' }}
      >
        <div className="pt-3 pb-2 flex justify-center"><div className="w-10 h-1.5 rounded-full bg-black/15" /></div>
        <div className="px-5 pb-3 flex items-center justify-between">
          <button onClick={close} className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">✕</button>
          <h3 className="font-bold text-[15px]">תמונת הפעילות</h3>
          <div className="w-9" />
        </div>

        <div className="px-5 pb-8 overflow-y-auto space-y-4">
          {/* תצוגה מקדימה של התמונה הנוכחית/הנבחרת */}
          <div style={{ width: '100%', height: 170, borderRadius: 16 }}
            className="overflow-hidden bg-brand-olive/10 flex items-center justify-center">
            {shown ? (
              <img src={shown} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="text-5xl">🖼️</span>
            )}
          </div>
          {preview && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-brand-muted flex-1">תצוגה מקדימה — לחצי "שמור תמונה" להחלה</span>
              <button onClick={() => setPreview(null)} className="text-[12px] font-semibold text-brand-muted">ביטול</button>
              <button onClick={confirm} className="px-4 h-9 rounded-full bg-brand-lime text-brand-ink text-[13px] font-bold">שמור תמונה</button>
            </div>
          )}
          {error && <div className="text-[13px] text-brand-olive font-semibold">{error}</div>}

          {/* 1. העלאת קובץ */}
          <div className="space-y-2">
            <div className="text-[11px] text-brand-muted font-bold uppercase tracking-wide">העלאה מהמכשיר</div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files?.[0])} />
            <button onClick={() => fileRef.current?.click()} disabled={busy}
              className="w-full py-3 rounded-soft bg-brand-lime text-brand-ink font-bold text-[14px] shadow-[0_4px_16px_rgba(197,217,48,0.3)] active:scale-[0.99] disabled:opacity-60">
              {busy ? 'מעבד…' : '📷 העלה תמונה'}
            </button>
          </div>

          {/* 2. הדבקת URL */}
          <div className="space-y-2">
            <div className="text-[11px] text-brand-muted font-bold uppercase tracking-wide">קישור לתמונה</div>
            <div className="flex gap-2">
              <input className="field flex-1" placeholder="הדבק קישור לתמונה"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && previewUrl(urlInput)} />
              <button onClick={() => previewUrl(urlInput)}
                className="px-4 rounded-soft border border-brand-ink/15 hover:bg-black/[0.04] text-[13px] font-bold whitespace-nowrap">תצוגה</button>
            </div>
          </div>

          {/* 3. חזרה ל-Unsplash */}
          <div className="pt-2 border-t border-black/[0.06]">
            <button onClick={backToUnsplash}
              className="w-full py-3 rounded-soft border border-brand-ink/15 text-[14px] font-semibold text-brand-ink active:scale-[0.99]">
              🔍 חפש תמונה אוטומטית (Unsplash)
            </button>
            {isManual && <div className="text-[11px] text-brand-muted/70 text-center mt-2">כרגע מוצגת תמונה ידנית</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
