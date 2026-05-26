import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function ShareSheet({ tripId, onClose }) {
  const [shares, setShares] = useState([]);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const link = `${window.location.origin}/?trip=${tripId}`;

  const load = async () => {
    const { data, error } = await supabase
      .from('trip_shares')
      .select('id, shared_with_email, permission')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });
    if (!error) setShares(data || []);
  };
  useEffect(() => { load(); }, [tripId]);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) { setError('כתובת אימייל לא תקינה'); return; }
    setBusy(true);
    const { error } = await supabase
      .from('trip_shares')
      .upsert({ trip_id: tripId, shared_with_email: clean, permission },
              { onConflict: 'trip_id,shared_with_email' });
    setBusy(false);
    if (error) { setError('שיתוף נכשל: ' + error.message); return; }
    setEmail('');
    load();
  };

  const remove = async (id) => {
    await supabase.from('trip_shares').delete().eq('id', id);
    load();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      prompt('העתיקי את הקישור:', link);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-brand-surface w-full sm:max-w-sm rounded-t-card sm:rounded-card p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="text-[17px] font-bold">שיתוף הטיול</div>
          <button onClick={onClose} className="text-brand-muted text-sm">סגור</button>
        </div>

        {/* קישור */}
        <div>
          <label className="label">קישור לטיול</label>
          <div className="flex gap-2">
            <input readOnly dir="ltr" className="field flex-1 text-[12px]" value={link} />
            <button onClick={copyLink} className="btn-primary shrink-0 px-4">
              {copied ? '✓ הועתק' : 'העתק'}
            </button>
          </div>
          <p className="text-[11px] text-brand-muted mt-1">
            הקישור פתוח רק למי שהוזמן לפי אימייל ומחובר עם אותה כתובת.
          </p>
        </div>

        {/* הוספת משתמש */}
        <form onSubmit={add} className="space-y-2 border-t border-black/5 pt-3">
          <label className="label">הזמנה לפי אימייל</label>
          <input type="email" dir="ltr" className="field" placeholder="name@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
          <div className="flex gap-2">
            <select className="field flex-1" value={permission}
              onChange={e => setPermission(e.target.value)}>
              <option value="view">צפייה בלבד</option>
              <option value="edit">עריכה</option>
            </select>
            <button type="submit" disabled={busy} className="btn-primary shrink-0 px-5 disabled:opacity-60">
              {busy ? '…' : 'הזמן'}
            </button>
          </div>
          {error && <div className="text-[13px] text-brand-red font-semibold">{error}</div>}
        </form>

        {/* רשימת שיתופים קיימים */}
        {shares.length > 0 && (
          <div className="space-y-2 border-t border-black/5 pt-3">
            <div className="text-[12px] font-bold text-brand-muted">משותף עם</div>
            {shares.map(s => (
              <div key={s.id} className="flex items-center gap-2 bg-brand-bg rounded-soft px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate" dir="ltr">{s.shared_with_email}</div>
                  <div className="text-[11px] text-brand-muted">{s.permission === 'edit' ? 'עריכה' : 'צפייה בלבד'}</div>
                </div>
                <button onClick={() => remove(s.id)} className="text-brand-red text-[12px] font-semibold">הסר</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
