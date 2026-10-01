/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unid: {
          navy: '#111622',
          dark: '#181C24',
          gold: '#F2B705',
          'gold-hover': '#dfa500',
          gray: '#F4F6F9',
          border: '#E2E8F0',
          text: '#1E293B',
          muted: '#64748B'
        },
        audit: {
          ord: '#059669',
          'ord-bg': '#ECFDF5',
          rec: '#D97706',
          'rec-bg': '#FFFBEB',
          re: '#0284C7',
          're-bg': '#F0F9FF',
          adeudo: '#DC2626',
          'adeudo-bg': '#FEF2F2',
          omitida: '#EA580C',
          'omitida-bg': '#FFF7ED',
          pendiente: '#64748B',
          'pendiente-bg': '#FFFFFF',
          cursando: '#4F46E5',
          'cursando-bg': '#EEF2FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
