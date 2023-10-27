module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  plugins: [require('daisyui')],
  theme: {
    extend: {
      daisyui: {
        themes: ["light", "dark"]
      },
    },
  },
  variants: {
    extend: {},
  },
}
