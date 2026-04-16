/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        positive: '#10b981', // Emerald-500
        neutral: '#f59e0b', // Amber-500
        negative: '#e11d48', // Rose-600
        dark: '#0f172a',
      }
    },
  },
  plugins: [],
}
