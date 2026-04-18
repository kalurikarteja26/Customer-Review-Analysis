/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',  // Ultra deep dark
        surface: '#18181b',     // Deep zinc
        primary: '#3b82f6',     // Neon Blue
        positive: '#10b981',    // Emerald-500
        neutral: '#fbbf24',     // Amber-400
        negative: '#f43f5e',    // Rose-500
        textMain: '#f4f4f5',    // Zinc 50
        textMuted: '#a1a1aa',   // Zinc 400
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite',
      }
    },
  },
  plugins: [],
}
