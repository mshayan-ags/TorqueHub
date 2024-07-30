/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Inter"', '"Segoe UI"', 'Roboto', 'sans-serif'],
        abril: ['"Abril Fatface"', "cursive"],
        actor: ['"Actor"', "sans-serif"],
        actorPro: ['"Actor"', "sans-serif"],
        advent: ['"Advent Pro"', "sans-serif"],
        adventPro: ['"Advent Pro"', "sans-serif"],
        inter: ['"Inter"', "sans-serif"],
        poppins: ['"Poppins"', "sans-serif"],
      },
      colors: {
        primary: "#f97316",
        "neutral-color-00": "#ffffff",
        "neutral-color-10": "#f1f5f9",
        "neutral-color-20": "#e2e8f0",
        "neutral-color-80": "#334155",
        "primary-color-dark-blue": "#003459",
        ink: "#1d1d1f",
        "ink-secondary": "#6e6e73",
        surface: "#f5f5f7",
        line: "#d2d2d7",
      },
    },
  },
  plugins: [],
};
