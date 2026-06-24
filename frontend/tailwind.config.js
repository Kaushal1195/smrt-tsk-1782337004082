/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo 600
        secondary: '#6366F1', // Indigo 500
        accent: '#EC4899', // Pink 500
        background: '#F8FAFC', // Slate 50
        text: '#1E293B', // Slate 800
        'text-light': '#475569', // Slate 600
      }
    },
  },
  plugins: [],
}
