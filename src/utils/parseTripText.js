// ממיר טקסט מובנה (מתוך מסמך Word) למבנה ימים של האפליקציה.
// מבנה מזוהה:
//   כותרת יום:     "יום N – יום <יום בשבוע> DD.MM.YY | <כותרת>"
//   כותרת פעילות:  שורה עם "|" שאחד מצדדיה הוא חלון זמן (בוקר/צהריים/אחה"צ/ערב/אופציונלי)
//                  או שעה (09:45), והצד השני הוא שם הפעילות.
//   שאר השורות:    תיאור השייך לפעילות הנוכחית.

const SLOT_WORDS = {
  'בוקר': 'morning',
  'צהריים': 'noon',
  'צהרים': 'noon',
  'אחה"צ': 'noon',
  'אחה״צ': 'noon',
  'אחהצ': 'noon',
  'ערב': 'evening',
  'לילה': 'evening',
  'אופציונלי': 'noon',
  'המשך': 'noon',
};

const isBareTime = s => /^\d{1,2}:\d{2}$/.test(s);

function slotFromTime(t) {
  const h = parseInt(t.split(':')[0], 10);
  if (h < 12) return 'morning';
  if (h < 17) return 'noon';
  return 'evening';
}

// מחזיר {slot, time} אם הצד הוא חלון-זמן, אחרת null
function asSlotSide(side) {
  const s = side.trim().replace(/[.,]+$/, '');
  if (SLOT_WORDS[s]) return { slot: SLOT_WORDS[s], time: '' };
  if (isBareTime(s)) return { slot: slotFromTime(s), time: s };
  return null;
}

function guessType(name) {
  const n = name.toLowerCase();
  if (/מסעד|ארוח|אוכל|קפה|מאפ|בר\b|קוקטייל/.test(name)) return 'restaurant';
  if (/נחית|רכבת|יציאה|חזרה|נסיעה|טיסה|שדה תעופה|airport/i.test(name)) return 'transport';
  return 'attraction';
}

const DAY_RE = /^יום\s+(\d+)\b/;

export function parseTripText(raw) {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const days = [];
  let cur = null;   // היום הנוכחי
  let act = null;   // הפעילות הנוכחית

  const pushDesc = (text) => {
    if (!cur) return;
    if (act) {
      act.description = act.description ? act.description + '\n' + text : text;
    } else {
      cur.intro = cur.intro ? cur.intro + '\n' + text : text;
    }
  };

  for (const line of lines) {
    const dayMatch = line.match(DAY_RE);
    if (dayMatch) {
      const dayNumber = parseInt(dayMatch[1], 10);
      const title = line.includes('|') ? line.split('|').slice(1).join('|').trim() : '';
      cur = { dayNumber, title, intro: '', activities: [] };
      act = null;
      days.push(cur);
      continue;
    }

    if (cur && line.includes('|')) {
      const idx = line.indexOf('|');
      const left = line.slice(0, idx);
      const right = line.slice(idx + 1);
      const leftSlot = asSlotSide(left);
      const rightSlot = asSlotSide(right);
      // כותרת פעילות רק אם בדיוק צד אחד הוא חלון-זמן, והשם אינו מסתיים ב-':'
      if (leftSlot && !rightSlot && right.trim() && !right.trim().endsWith(':')) {
        act = newActivity(right.trim(), leftSlot);
        cur.activities.push(act);
        continue;
      }
      if (rightSlot && !leftSlot && left.trim() && !left.trim().endsWith(':')) {
        act = newActivity(left.trim(), rightSlot);
        cur.activities.push(act);
        continue;
      }
      // אחרת — שורת תיאור רגילה
      pushDesc(line);
      continue;
    }

    pushDesc(line);
  }

  return days;
}

function newActivity(name, { slot, time }) {
  return {
    name,
    type: guessType(name),
    timeSlot: slot,
    duration: time || '',
    description: '',
  };
}
