import React, { useRef, useState } from 'react';
import { useTrip } from '../context/TripContext.jsx';
import ShareSheet from './ShareSheet.jsx';

// Header ראשי משותף לשני המצבים. רק כפתור המעבר משנה טקסט/אייקון לפי המצב הנוכחי.
export default function Header() {
  const { state, mode, setMode, exportJson, exportPdf, importJson, importWord, user, signOut, setGuest, activeTripId, closeTrip, activePermission } = useTrip();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const fileInput = useRef();
  const wordInput = useRef();
  const isPlanning = mode === 'planning';
  const isOwner = activePermission === 'owner';
  const isViewOnly = activePermission === 'view';

  return (
    <div className="bg-[#E8F3E9] text-brand-ink">
      <div className="px-4 h-16 flex items-center gap-3">
        {/* ימין (RTL) — מעבר מצב, מעודן/outlined */}
        <button onClick={() => setMode(isPlanning ? 'trip' : 'planning')}
          className="shrink-0 h-9 px-3.5 rounded-full border border-brand-ink/40 text-brand-ink text-[13px] font-semibold flex items-center gap-1.5 active:scale-95 hover:bg-black/10 transition"
          title={isPlanning ? 'עבור למצב טיול' : 'עבור למצב תכנון'}>
          {isPlanning ? '🗺️ מצב טיול' : '✏️ מצב תכנון'}
        </button>
        <div className="flex-1 text-center min-w-0">
          <div className="text-[16px] font-bold truncate">{state.meta.title}</div>
          <div className="text-[12px] text-brand-ink/60">
            {isViewOnly ? '👁️ צפייה בלבד' : (isPlanning ? 'תכנון' : 'טיול')}
          </div>
        </div>
        {/* שמאל — תפריט שלוש נקודות */}
        <div className="relative shrink-0">
          <button onClick={() => setMenuOpen(v => !v)}
            className="w-9 h-9 rounded-full hover:bg-black/10 flex items-center justify-center text-2xl leading-none pb-2 text-brand-ink"
            title="אפשרויות" aria-label="אפשרויות">⋯</button>
          {menuOpen && (
            <>
              <div className="fixed inset-0" style={{ zIndex: 199 }} onClick={() => setMenuOpen(false)} />
              <div className="absolute left-0 mt-1.5 w-44 py-1.5"
                style={{
                  background: '#F7F5EF',
                  color: '#1A1A1A',
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 200
                }}>
                <button onClick={() => { fileInput.current?.click(); setMenuOpen(false); }}
                  className="w-full text-right px-4 py-2.5 text-[13px] font-semibold hover:bg-black/[0.04]">ייבוא JSON</button>
                <button onClick={() => { exportJson(); setMenuOpen(false); }}
                  className="w-full text-right px-4 py-2.5 text-[13px] font-semibold hover:bg-black/[0.04]">ייצוא JSON</button>
                <button onClick={() => { exportPdf(); setMenuOpen(false); }}
                  className="w-full text-right px-4 py-2.5 text-[13px] font-semibold hover:bg-black/[0.04]">📄 ייצוא PDF</button>
                <button onClick={() => { wordInput.current?.click(); setMenuOpen(false); }}
                  className="w-full text-right px-4 py-2.5 text-[13px] font-semibold hover:bg-black/[0.04]">ייבוא WORD</button>
                <div className="my-1 border-t border-black/5" />
                {user && activeTripId && isOwner && (
                  <button onClick={() => { setShareOpen(true); setMenuOpen(false); }}
                    className="w-full text-right px-4 py-2.5 text-[13px] font-semibold hover:bg-black/[0.04]">🔗 שתף טיול</button>
                )}
                {user && activeTripId && (
                  <button onClick={() => { closeTrip(); setMenuOpen(false); }}
                    className="w-full text-right px-4 py-2.5 text-[13px] font-semibold hover:bg-black/[0.04]">← הטיולים שלי</button>
                )}
                {user ? (
                  <>
                    <div className="px-4 py-1 text-[11px] text-brand-muted truncate" dir="ltr">{user.email}</div>
                    <button onClick={() => { signOut(); setMenuOpen(false); }}
                      className="w-full text-right px-4 py-2.5 text-[13px] font-semibold text-brand-red hover:bg-black/[0.04]">התנתקות</button>
                  </>
                ) : (
                  <button onClick={() => { setGuest(false); setMenuOpen(false); }}
                    className="w-full text-right px-4 py-2.5 text-[13px] font-semibold hover:bg-black/[0.04]">התחברות / סנכרון</button>
                )}
              </div>
            </>
          )}
        </div>
        <input ref={fileInput} type="file" accept="application/json" className="hidden"
          onChange={e => e.target.files?.[0] && importJson(e.target.files[0])} />
        <input ref={wordInput} type="file" accept=".docx" className="hidden"
          onChange={e => { if (e.target.files?.[0]) importWord(e.target.files[0]); e.target.value = ''; }} />
      </div>
      {shareOpen && activeTripId && <ShareSheet tripId={activeTripId} onClose={() => setShareOpen(false)} />}
    </div>
  );
}
