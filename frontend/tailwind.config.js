/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f5e6',
          100: '#f1e7bf',
          200: '#e9d78f',
          300: '#e1c85f',
          400: '#daba3a',
          500: '#d4af37', // gold
          600: '#b38f25',
          700: '#8f6f1b',
          800: '#6b5113',
          900: '#4a370c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}