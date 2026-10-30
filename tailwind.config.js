/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(148, 163, 184, 0.35), 0 30px 80px rgba(14, 116, 144, 0.35)',
      },
    },
  },
  plugins: [],
};
