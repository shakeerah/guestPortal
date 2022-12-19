/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular'],
        Monoton: ['Monoton', 'cursive'],
        Rubik: ['"Rubik Moonrocks"', 'cursive'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
