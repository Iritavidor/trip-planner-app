import React, { useEffect, useRef, useState } from 'react';

const SLOT_STYLE = {
  morning: { bg: '#eae9d2', text: '#1A1A1A', label: 'בוקר' },
  noon: { bg: '#eae9d2', text: '#1A1A1A', label: 'צהריים' },
  evening: { bg: '#eae9d2', text: '#1A1A1A', label: 'ערב' }
};

export default function ActivitySheet({ activity, onClose }) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const onKey = e => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 300);
  };

  const onTouchStart = e => { startY.current = e.touches[0].clientY; };
  const onTouchMove = e => {
    if (startY.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDragY(dy);
  };
  const onTouchEnd = () => {
    if (dragY > 80) close();
    else setDragY(0);
    startY.current = null;
  };

  const a = activity;
  const slot = SLOT_STYLE[a.timeSlot] || SLOT_STYLE.morning;
  const mapHref = a.mapUrl || (a.address ? `https://maps.google.com/?q=${encodeURIComponent(a.address)}` : null);

  const translateY = closing ? '100%' : mounted ? `${dragY}px` : '100%';

  return (
    <div className="fixed inset-0 flex items-end" style={{ zIndex: 100 }}>
      <div
        onClick={close}
        style={{
          background: 'rgba(0,0,0,0.6)',
          opacity: closing || !mounted ? 0 : 1,
          transition: 'opacity 0.3s ease',
          zIndex: 100
        }}
        className="absolute inset-0"
      />
      <div
        className="relative w-full flex flex-col"
        style={{
          zIndex: 101,
          background: '#fffde0',
          maxHeight: '85vh',
          borderRadius: '24px 24px 0 0',
          transform: `translateY(${translateY})`,
          transition: startY.current == null ? 'transform 0.3s ease' : 'none',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.18)'
        }}
      >
        {/* Drag handle */}
        <div
          className="pt-2.5 flex justify-center"
          style={{ marginBottom: '8px' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div style={{ width: 40, height: 4, borderRadius: 999, background: '#D1D5DB' }} />
        </div>

        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-3 left-3 flex items-center justify-center"
          style={{ width: 32, height: 32, borderRadius: 999, background: '#EDE9E0', color: '#7A7468', fontSize: 14, zIndex: 102 }}
          aria-label="סגור"
        >
          ✕
        </button>

        {/* Content */}
        <div className="overflow-y-auto px-5 pb-6 pt-2">
          {/* Title */}
          <div className="pl-10 mb-2">
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>
              {a.name || '(ללא שם)'}
            </h2>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                background: slot.bg,
                color: slot.text,
                padding: '3px 10px',
                borderRadius: 999
              }}
            >
              {slot.label}
            </span>
            {a.duration && <span style={{ fontSize: 12, color: '#7A7468' }}>{a.duration}</span>}
          </div>

          {/* Image */}
          {a.image && (
            <img
              src={a.image}
              alt={a.name}
              width="400"
              height="180"
              loading="lazy"
              onError={e => { e.currentTarget.style.display = 'none'; }}
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 16, marginBottom: 16, display: 'block' }}
            />
          )}

          {/* Description */}
          {a.description && (
            <p
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: '#3F3A30',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                marginBottom: 16
              }}
            >
              {a.description}
            </p>
          )}

          {/* Info rows */}
          <div className="space-y-0.5 mb-4">
            {a.address && <Row icon="📍" label="כתובת" value={a.address} />}
            {a.openingHours && <Row icon="🕐" label="שעות פתיחה" value={a.openingHours} />}
            {a.entryFee && <Row icon="💰" label="דמי כניסה" value={a.entryFee} />}
            {a.phone && <Row icon="📞" label="טלפון" value={a.phone} />}
            {a.ticketInfo?.hasTicket && a.ticketInfo.confirmationNo && (
              <Row icon="🎫" label="אישור כרטיס" value={a.ticketInfo.confirmationNo} />
            )}
            {a.ticketInfo?.hasTicket && a.ticketInfo.bookingRef && (
              <Row icon="🔖" label="קוד הזמנה" value={a.ticketInfo.bookingRef} />
            )}
          </div>

          {/* Tips */}
          {a.tips && (
            <div
              style={{
                background: 'rgba(197,217,48,0.15)',
                borderRadius: 16,
                padding: 14,
                marginBottom: 16
              }}
            >
              <div style={{ fontSize: 11, color: '#3D4A2A', fontWeight: 700, marginBottom: 4 }}>טיפים</div>
              <div style={{ fontSize: 14, color: '#3F3A30', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{a.tips}</div>
            </div>
          )}

          {/* Map button */}
          {mapHref && (
            <a
              href={mapHref}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 44,
                width: '100%',
                borderRadius: 100,
                border: '1px solid rgba(26,26,26,0.15)',
                color: '#1A1A1A',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              פתח במפות
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <span style={{ fontSize: 16, lineHeight: '20px' }}>{icon}</span>
      <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
        <span style={{ fontSize: 13, color: '#7A7468' }}>{label}</span>
        <span style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 500, wordBreak: 'break-word' }}>{value}</span>
      </div>
    </div>
  );
}
