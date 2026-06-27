/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'gg-primary': {
          DEFAULT: '#F08B1D',
          700: '#D97A16',
          900: '#b66f12',
        },
        'gg-secondary': '#3E4B59',
      },
      fontFamily: {
        aleo: ['Aleo', 'serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
