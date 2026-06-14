import React, { useRef } from 'react';
import { useTrip } from '../context/TripContext.jsx';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB לכל קובץ
const uid = () => Math.random().toString(36).slice(2, 10);

// רובריקת "מסמכים נוספים" ליום — מספר קבצים (PDF/תמונות) הנשמרים כ-base64 ב-JSON,
// בדומה למסמך המצורף במלונות. בשימוש גם במצב תכנון וגם במצב טיול.
export default function DayDocuments({ dayNumber, documents }) {
  const { dispatch } = useTrip();
  const docs = documents || [];
  const inputRef = useRef(null);

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const accepted = [];
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        alert(`הקובץ "${file.name}" חורג מ-2MB ולכן לא צורף.`);
        continue;
      }
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      accepted.push({ id: uid(), name: file.name, data });
    }
    if (accepted.length) {
      dispatch({ type: 'UPDATE_DAY', dayNumber, patch: { documents: [...docs, ...accepted] } });
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeDoc = (id) =>
    dispatch({ type: 'UPDATE_DAY', dayNumber, patch: { documents: docs.filter(d => d.id !== id) } });

  return (
    <div className="card mt-6">
      <div className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-2">מסמכים נוספים</div>
      {docs.length > 0 && (
        <div className="space-y-2 mb-3">
          {docs.map(d => (
            <div key={d.id} className="flex items-center gap-2 bg-brand-bg rounded-soft px-3 py-2">
              <a href={d.data} target="_blank" rel="noreferrer" download={d.name || 'document'}
                className="flex-1 text-[13px] font-semibold text-brand-red truncate">📎 {d.name || 'מסמך'}</a>
              <button className="text-brand-muted text-sm"
                onClick={() => { if (confirm('למחוק את המסמך?')) removeDoc(d.id); }}>הסר</button>
            </div>
          ))}
        </div>
      )}
      <label className="btn bg-brand-lime/30 text-brand-olive w-full text-sm cursor-pointer flex items-center justify-center">
        + הוסף קבצים (PDF / תמונות · עד 2MB)
        <input ref={inputRef} type="file" accept="application/pdf,image/*" multiple className="hidden"
          onChange={e => addFiles(e.target.files)} />
      </label>
    </div>
  );
}
