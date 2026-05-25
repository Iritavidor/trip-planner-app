import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { readDocx } from '../utils/readDocx.js';
import { parseTripText } from '../utils/parseTripText.js';

const STORAGE_KEY = 'china-trip-data-v1';
const MODE_KEY = 'china-trip-mode-v1';

const uid = () => Math.random().toString(36).slice(2, 10);

function makeInitialData() {
  const startDate = new Date('2026-09-12');
  startDate.setHours(0, 0, 0, 0);
  const days = {};
  for (let i = 1; i <= 20; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + (i - 1));
    days[i] = {
      dayNumber: i,
      date: d.toISOString().slice(0, 10),
      city: '',
      activities: [],
      restaurant: '',
      notes: ''
    };
  }

  // Day 1 – שבת 12.09.26 – נחיתה בשנגחאי
  days[1].city = 'שנגחאי';
  days[1].activities = [
    {
      id: uid(),
      name: 'נחיתה בשנגחאי – Pudong Airport (PVG)',
      type: 'transport',
      timeSlot: 'morning',
      duration: '09:45 · נסיעה כ-50 דק׳ למרכז',
      address: 'Shanghai Pudong International Airport (PVG)',
      description: 'מומלץ לשריין נהג מיניבוס שיחכה לכם מחוץ לאיסוף המזוודות עם שלט ובו שמכם וייקח אתכם למלון הנבחר. עלות כ-315 ש״ח. זמן נסיעה למרכז העיר: כ-50 דקות נסיעה.',
      tips: 'הנהג ימתין מחוץ לאיסוף המזוודות עם שלט. וודאו שיש לכם את שם המלון באנגלית ובסינית.',
      openingHours: 'נחיתה 09:45',
      entryFee: '~315 ש״ח (מיניבוס)',
      ticketInfo: { hasTicket: false, confirmationNo: '', bookingRef: '', notes: '' },
      mapUrl: '',
      phone: ''
    },
    {
      id: uid(),
      name: 'East Nanjing Road + The Bund',
      type: 'attraction',
      timeSlot: 'noon',
      duration: '~3-4 שעות כולל ארוחה',
      address: 'East Nanjing Road, Shanghai',
      description: 'לצעוד על Nanjing East – רחוב הקניות הארוך בעולם. אחד הרחובות המרכזיים, מלא חנויות, בתי קפה ואתרים מעניינים. הליכה של כשני ק״מ עד ה-BUND (בונד) – אזור היסטורי בשנגחאי לאורך נהר חוואנגפו, ידוע בקו הרקיע המרשים של בניינים קולוניאליים בסגנונות אירופאים.',
      tips: 'ארוחת צהריים: מסעדה מקומית Restaurant Grandmother Shanghai – ניתן למצוא בגוגל מפות.',
      openingHours: '',
      entryFee: 'חינם',
      ticketInfo: { hasTicket: false, confirmationNo: '', bookingRef: '', notes: '' },
      mapUrl: 'https://maps.google.com/?q=The+Bund+Shanghai',
      phone: ''
    },
    {
      id: uid(),
      name: 'Yu Garden (גני יו)',
      type: 'attraction',
      timeSlot: 'evening',
      duration: '~3 שעות כולל ארוחת ערב',
      address: 'Yuyuan Garden, Anren Street, Shanghai',
      description: '20 דקות מטרו (קו 14) או נסיעה של 10 דקות ב-Didi לגנים המסורתיים יו גארדן. בעבר, אלו היו גנים פרטיים שפקיד בכיר מתקופת שושלת מינג בנה עבור הוריו, כדי שיהיה להם מקום שקט, יפה ושלו להזדקן בו. כיום, המתחם מחולק לחמישה אזורים מרכזיים, עם אזורים שוקקי חיים – חנויות, דוכני מזכרות, תה, ממתקים סיניים ועבודות יד. בערב כל האורות נדלקים – תרגישו כמו בתוך תפאורה של סרט.',
      tips: 'עצירה ב-Tea Hey לטעימת תה קר מקומי. מומלצים: Hot Brown Sugar Bobo Milk (热烤黑糖波波牛乳) ו-Mango Pomelo Sago (超多肉芒芒甘露). ארוחת ערב בפוד קורט שנמצא במקום – נקי ואסתטי.',
      openingHours: '',
      entryFee: '',
      ticketInfo: { hasTicket: false, confirmationNo: '', bookingRef: '', notes: '' },
      mapUrl: 'https://maps.google.com/?q=Yu+Garden+Shanghai',
      phone: ''
    }
  ];
  days[1].restaurant = 'Restaurant Grandmother Shanghai (צהריים) · פוד קורט ב-Yu Garden (ערב)';
  days[1].notes = 'יום נחיתה והתאקלמות – לקחת את היום בקצב נינוח, להישאר ערים עד הערב כדי להתגבר על ה-jet lag.';

  return {
    meta: {
      title: 'סין · 20 ימים',
      dates: { start: days[1].date, end: days[20].date },
      country: 'סין',
      travelers: ''
    },
    description: '',
    budget: '',
    emergencyContacts: '',
    flights: [],
    hotels: [],
    days,
    packing: [],
    todos: [],
    todosMonth: [],
    todosTwoWeeks: [],
    todosWeek: [],
    todosDay: [],
    generalNotes: ''
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeInitialData();
    return { ...makeInitialData(), ...JSON.parse(raw) };
  } catch {
    return makeInitialData();
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'REPLACE_ALL':
      return action.data;
    case 'UPDATE_META':
      return { ...state, meta: { ...state.meta, ...action.patch } };
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_FLIGHT':
      return { ...state, flights: [...state.flights, { id: uid(), ...action.flight }] };
    case 'UPDATE_FLIGHT':
      return { ...state, flights: state.flights.map(f => f.id === action.id ? { ...f, ...action.patch } : f) };
    case 'DELETE_FLIGHT':
      return { ...state, flights: state.flights.filter(f => f.id !== action.id) };
    case 'ADD_HOTEL':
      return { ...state, hotels: [...state.hotels, { id: uid(), ...action.hotel }] };
    case 'UPDATE_HOTEL':
      return { ...state, hotels: state.hotels.map(h => h.id === action.id ? { ...h, ...action.patch } : h) };
    case 'DELETE_HOTEL':
      return { ...state, hotels: state.hotels.filter(h => h.id !== action.id) };
    case 'UPDATE_DAY':
      return { ...state, days: { ...state.days, [action.dayNumber]: { ...state.days[action.dayNumber], ...action.patch } } };
    case 'IMPORT_DAYS': {
      const days = { ...state.days };
      for (const pd of action.days) {
        const existing = days[pd.dayNumber];
        if (!existing) continue;
        const activities = pd.activities.map(a => ({
          id: uid(),
          name: a.name || '',
          type: a.type || 'attraction',
          timeSlot: a.timeSlot || 'morning',
          duration: a.duration || '',
          address: '',
          description: a.description || '',
          tips: '',
          openingHours: '',
          entryFee: '',
          ticketInfo: { hasTicket: false, confirmationNo: '', bookingRef: '', notes: '' },
          mapUrl: '',
          phone: ''
        }));
        days[pd.dayNumber] = {
          ...existing,
          activities,
          notes: [pd.title, pd.intro].filter(Boolean).join('\n') || existing.notes
        };
      }
      return { ...state, days };
    }
    case 'ADD_ACTIVITY': {
      const day = state.days[action.dayNumber];
      const activity = { id: uid(), name: '', type: 'attraction', timeSlot: 'morning', duration: '', address: '', description: '', tips: '', openingHours: '', entryFee: '', ticketInfo: { hasTicket: false, confirmationNo: '', bookingRef: '', notes: '' }, mapUrl: '', phone: '', ...action.activity };
      return { ...state, days: { ...state.days, [action.dayNumber]: { ...day, activities: [...day.activities, activity] } } };
    }
    case 'UPDATE_ACTIVITY': {
      const day = state.days[action.dayNumber];
      return { ...state, days: { ...state.days, [action.dayNumber]: { ...day, activities: day.activities.map(a => a.id === action.id ? { ...a, ...action.patch } : a) } } };
    }
    case 'DELETE_ACTIVITY': {
      const day = state.days[action.dayNumber];
      return { ...state, days: { ...state.days, [action.dayNumber]: { ...day, activities: day.activities.filter(a => a.id !== action.id) } } };
    }
    case 'ADD_LIST_ITEM':
      return { ...state, [action.list]: [...state[action.list], { id: uid(), text: action.text, checked: false }] };
    case 'TOGGLE_LIST_ITEM':
      return { ...state, [action.list]: state[action.list].map(i => i.id === action.id ? { ...i, checked: !i.checked } : i) };
    case 'UPDATE_LIST_ITEM':
      return { ...state, [action.list]: state[action.list].map(i => i.id === action.id ? { ...i, text: action.text } : i) };
    case 'DELETE_LIST_ITEM':
      return { ...state, [action.list]: state[action.list].filter(i => i.id !== action.id) };
    default:
      return state;
  }
}

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [mode, setMode] = React.useState(() => localStorage.getItem(MODE_KEY) || 'planning');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `china-trip-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        dispatch({ type: 'REPLACE_ALL', data: { ...makeInitialData(), ...data } });
        alert('יובא בהצלחה');
      } catch {
        alert('שגיאה בקריאת הקובץ');
      }
    };
    reader.readAsText(file);
  };

  const importWord = async (file) => {
    try {
      const text = await readDocx(file);
      const days = parseTripText(text);
      if (!days.length) { alert('לא זוהו ימים במסמך. ודאי שכל יום מתחיל ב"יום N".'); return; }
      const totalActs = days.reduce((s, d) => s + d.activities.length, 0);
      const ok = confirm(`זוהו ${days.length} ימים ו-${totalActs} פעילויות.\nהפעילויות בימים אלו יוחלפו (טיסות, מלונות ועיר לא ישתנו). להמשיך?`);
      if (!ok) return;
      dispatch({ type: 'IMPORT_DAYS', days });
      alert(`יובאו ${days.length} ימים בהצלחה ✓`);
    } catch (e) {
      alert('שגיאה בקריאת קובץ ה-Word: ' + e.message);
    }
  };

  return (
    <TripContext.Provider value={{ state, dispatch, mode, setMode, save, exportJson, importJson, importWord }}>
      {children}
    </TripContext.Provider>
  );
}

export const useTrip = () => useContext(TripContext);
