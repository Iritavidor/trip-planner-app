/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#e8f3e9',       // רקע ראשי – ירוק-מנטה רך
          surface: '#F7F5EF',  // כרטיסים / משטחים – קרם בהיר
          lime: '#C5D930',     // פעולה ראשית / הדגשות
          ink: '#1A1A1A',      // טקסט ראשי / כפתורים כהים
          muted: '#7A7468',    // טקסט משני
          olive: '#3D4A2A',    // אקסנט ירוק כהה
          // legacy aliases — ממופים לפלטה החדשה לשמירת תאימות
          red: '#3D4A2A',
          gold: '#C5D930',
          dark: '#1A1A1A',
          cream: '#F7F5EF'
        }
      },
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '24px',
        soft: '16px'
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0,0,0,0.04)',
        'soft-lg': '0 8px 30px rgba(0,0,0,0.06)'
      }
    }
  },
  plugins: []
};
