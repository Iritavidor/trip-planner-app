// טעינת תמונות לפעילויות: חיפוש ב-Unsplash API, fallback לפי קטגוריה,
// ו-cache ב-localStorage לפי שם המקום כדי לא לקרוא ל-API שוב ושוב.

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const CACHE_KEY = 'china-trip-images-v1';

// תמונות fallback לפי קטגוריה
const FALLBACKS = {
  food: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
  culture: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400',
  nature: 'https://images.unsplash.com/photo-1537531383668-0dca0d581d6c?w=400',
  default: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400',
};

function fallbackFor(type, name = '') {
  const n = name.toLowerCase();
  if (type === 'restaurant' || /מסעד|ארוח|אוכל|קפה|מאפ|food|restaurant|cafe/.test(n)) return FALLBACKS.food;
  if (/מוזיאון|תרבות|גלרי|אמנות|מקדש|תיאטרון|museum|gallery|art|temple|theatre|theater/.test(n)) return FALLBACKS.culture;
  if (/פארק|גן\b|גנים|טבע|אגם|הר\b|park|garden|nature|lake|mountain/.test(n)) return FALLBACKS.nature;
  return FALLBACKS.default;
}

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; }
  catch { return {}; }
}
function writeCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* quota */ }
}

const FALLBACK_URLS = Object.values(FALLBACKS);

export function getCachedImage(placeName) {
  if (!placeName) return null;
  const url = readCache()[placeName.trim()] || null;
  // התעלם מ-fallback שנשמר בטעות בעבר — כדי לאפשר חיפוש אמיתי מחדש
  if (url && FALLBACK_URLS.includes(url)) return null;
  return url;
}

export function setCachedImage(placeName, url) {
  if (!placeName) return;
  const cache = readCache();
  cache[placeName.trim()] = url;
  writeCache(cache);
}

// מחזיר URL תמונה: cache → Unsplash API → fallback לפי קטגוריה.
// force=true מדלג על ה-cache וקורא ל-API מחדש.
export async function getActivityImage(placeName, type, { force = false } = {}) {
  const key = (placeName || '').trim();
  if (key && !force) {
    const cached = getCachedImage(key);
    if (cached) return cached;
  }

  if (key && ACCESS_KEY) {
    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(key + ' China attraction')}&per_page=1&client_id=${ACCESS_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const found = data?.results?.[0]?.urls?.small || data?.results?.[0]?.urls?.regular;
        if (found) {
          setCachedImage(key, found);
          return found;
        }
      }
    } catch {
      /* נופל ל-fallback */
    }
  }

  // לא שומרים fallback ב-cache, כדי שחיפוש אמיתי יתבצע שוב בפעם הבאה
  return fallbackFor(type, key);
}
