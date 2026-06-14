import { jsPDF } from 'jspdf';
import bidiFactory from 'bidi-js';
import { ALEF_REGULAR_BASE64 } from './hebrewFont.js';

// ייצוא PDF של "התכנון היבש" של הטיול, בעברית עם תמיכה ב-RTL.
// jsPDF אינו מבצע סידור דו-כיווני (BiDi) בעצמו, לכן כל מחרוזת מומרת לסדר חזותי
// באמצעות bidi-js ומצוירת מיושרת לימין. הפונט Alef משובץ כדי לתמוך בתווים בעברית.

const bidi = bidiFactory();
const FONT = 'Alef';
const SLOT = { morning: 'בוקר', noon: 'צהריים', evening: 'ערב' };

// המרת מחרוזת מסדר לוגי לסדר חזותי (לשורה בודדת)
function visualLine(line) {
  if (!line) return '';
  const levels = bidi.getEmbeddingLevels(line, 'rtl');
  return bidi.getReorderedString(line, levels);
}

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).split('-');
  if (!y || !m || !d) return String(iso);
  return `${d}/${m}/${y}`;
}

export function exportTripPdf(state) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.addFileToVFS('Alef-Regular.ttf', ALEF_REGULAR_BASE64);
  doc.addFont('Alef-Regular.ttf', FONT, 'normal');
  doc.setFont(FONT, 'normal');

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const rightX = pageW - margin;
  const maxWidth = pageW - margin * 2;
  let y = margin;

  const ensure = (space) => {
    if (y + space > pageH - margin) { doc.addPage(); doc.setFont(FONT, 'normal'); y = margin; }
  };

  // כתיבת טקסט מיושר לימין, עם גלישת שורות וסידור חזותי לכל שורה
  const line = (text, { size = 11, gap = 1.5, color = [40, 40, 40], indent = 0 } = {}) => {
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lh = size * 0.45; // מ"מ לשורה (קירוב נוח)
    const wrapped = doc.splitTextToSize(String(text ?? ''), maxWidth - indent);
    for (const wl of wrapped) {
      ensure(lh + gap);
      doc.text(visualLine(wl), rightX - indent, y, { align: 'right' });
      y += lh + gap;
    }
  };

  const spacer = (h = 3) => { ensure(h); y += h; };
  const rule = () => {
    ensure(4);
    doc.setDrawColor(210);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  };

  // --- כותרת הטיול ותאריכים ---
  const m = state.meta || {};
  line(m.title || 'טיול', { size: 20 });
  const start = fmtDate(m.dates?.start);
  const end = fmtDate(m.dates?.end);
  if (start || end) line([start, end].filter(Boolean).join(' – '), { size: 12, color: [90, 90, 90] });
  const sub = [m.country, m.travelers].filter(Boolean).join(' · ');
  if (sub) line(sub, { size: 11, color: [90, 90, 90] });
  spacer(2);
  rule();

  // --- טיסות ---
  if (state.flights?.length) {
    line('טיסות', { size: 15, color: [178, 34, 34] });
    spacer(1);
    state.flights.forEach(f => {
      const head = [f.direction, f.airline, f.flightNo].filter(Boolean).join(' · ');
      line(head || 'טיסה', { size: 12 });
      const det = [
        fmtDate(f.date),
        f.departureTime ? `${f.departureTime}${f.arrivalTime ? '→' + f.arrivalTime : ''}` : ''
      ].filter(Boolean).join(' · ');
      if (det) line(det, { size: 10, color: [90, 90, 90], indent: 4 });
      spacer(1.5);
    });
    rule();
  }

  // --- מלונות ---
  if (state.hotels?.length) {
    line('מלונות', { size: 15, color: [178, 34, 34] });
    spacer(1);
    state.hotels.forEach(h => {
      line([h.name, h.city].filter(Boolean).join(' · ') || 'מלון', { size: 12 });
      const ci = [fmtDate(h.checkIn), fmtDate(h.checkOut)].filter(Boolean).join(' – ');
      if (ci) line(`צ׳ק-אין/אאוט: ${ci}`, { size: 10, color: [90, 90, 90], indent: 4 });
      if (h.address) line(`כתובת: ${h.address}`, { size: 10, color: [90, 90, 90], indent: 4 });
      spacer(1.5);
    });
    rule();
  }

  // --- ימים ---
  const days = Object.values(state.days || {}).sort((a, b) => a.dayNumber - b.dayNumber);
  days.forEach(d => {
    ensure(16);
    const dh = [`יום ${d.dayNumber}`, fmtDate(d.date), d.city].filter(Boolean).join(' · ');
    line(dh, { size: 14, color: [60, 80, 30] });
    if (d.activities?.length) {
      d.activities.forEach((a, i) => {
        line(`${i + 1}. ${a.name || '(ללא שם)'}`, { size: 11, indent: 3 });
        const time = a.duration || SLOT[a.timeSlot] || '';
        const det = [time, a.address].filter(Boolean).join(' · ');
        if (det) line(det, { size: 9.5, color: [110, 110, 110], indent: 7 });
      });
    } else {
      line('אין פעילויות', { size: 10, color: [150, 150, 150], indent: 3 });
    }
    if (d.restaurant) line(`מסעדה: ${d.restaurant}`, { size: 10, color: [90, 90, 90], indent: 3 });
    spacer(3.5);
  });

  const safe = (m.title || 'trip').trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_') || 'trip';
  doc.save(`${safe}.pdf`);
}
