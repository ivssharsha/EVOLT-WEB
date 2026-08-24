/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        evolt: {
          dark: '#0a0f1d',
          card: '#111827',
          surface: '#1e293b',
          border: '#334155',
          primary: '#10b981',     // emerald-500
          accent: '#06b6d4',      // cyan-500
          warning: '#f59e0b',     // amber-500
          danger: '#ef4444',      // red-500
          light: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
