import React, { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useTrip } from '../context/TripContext.jsx';

// תרגום הודעות שגיאה נפוצות של Supabase לעברית
function translateError(msg = '') {
  if (/invalid login credentials/i.test(msg)) return 'אימייל או סיסמה שגויים';
  if (/already registered/i.test(msg)) return 'כתובת האימייל כבר רשומה';
  if (/password should be at least/i.test(msg)) return 'הסיסמה חייבת להכיל לפחות 6 תווים';
  if (/unable to validate email/i.test(msg) || /invalid email/i.test(msg)) return 'כתובת אימייל לא תקינה';
  if (/email not confirmed/i.test(msg)) return 'יש לאשר את כתובת האימייל לפני ההתחברות';
  return msg || 'אירעה שגיאה, נסי שוב';
}

export default function Auth() {
  const { setGuest } = useTrip();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isLogin = mode === 'login';

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange ב-TripContext יקלוט את ה-session
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setInfo('נשלח אליך מייל אימות. אשרי אותו ואז התחברי.');
          setMode('login');
        }
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-brand-bg">
      <div className="card w-full max-w-sm space-y-4">
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold text-brand-red">🇨🇳 סין · 20 ימים</div>
          <div className="text-[13px] text-brand-muted">
            {isLogin ? 'התחברי כדי לסנכרן את הטיול שלך' : 'הרשמה לחשבון חדש'}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">אימייל</label>
            <input type="email" required dir="ltr" autoComplete="email"
              className="field" value={email}
              onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">סיסמה</label>
            <input type="password" required dir="ltr"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="field" value={password}
              onChange={e => setPassword(e.target.value)} />
          </div>

          {error && <div className="text-[13px] text-brand-red font-semibold">{error}</div>}
          {info && <div className="text-[13px] text-green-700 font-semibold">{info}</div>}

          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? 'רגע…' : isLogin ? 'התחברות' : 'הרשמה'}
          </button>
        </form>

        <button
          onClick={() => { setError(''); setInfo(''); setMode(isLogin ? 'signup' : 'login'); }}
          className="w-full text-[13px] text-brand-muted hover:text-brand-ink">
          {isLogin ? 'אין לך חשבון? להרשמה' : 'כבר יש לך חשבון? להתחברות'}
        </button>

        <div className="pt-2 border-t border-black/5">
          <button onClick={() => setGuest(true)}
            className="w-full text-[13px] font-semibold text-brand-muted hover:text-brand-ink">
            המשך ללא חשבון (שמירה מקומית בלבד) ←
          </button>
        </div>
      </div>
    </div>
  );
}
