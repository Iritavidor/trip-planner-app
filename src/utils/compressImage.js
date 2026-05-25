// קורא קובץ תמונה, מקטין ל-max 800px רוחב, ומחזיר base64 (JPEG)
// כדי לא לפוצץ את מכסת ה-localStorage.

const MAX_WIDTH = 800;

export function compressImage(file, maxWidth = MAX_WIDTH) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('הקובץ אינו תמונה תקינה'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch (e) {
          reject(e);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
