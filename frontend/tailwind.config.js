/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uganda: {
          black: '#000000',
          yellow: '#FFCE00',
          red: '#D90000',
          darkRed: '#990000',
          green: '#10B981',
          teal: '#0D9488'
        }
      }
    },
  },
  plugins: [],
}

