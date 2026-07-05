/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          400: '#f87171',
          500: '#e8192c',
          600: '#c21525',
          700: '#9b1020',
        }
      }
    },
  },
  plugins: [],
}
