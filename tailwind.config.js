/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          violet: "#2D1457",
          coral: "#FF6B57",
          green: "#84CC16"
        }
      }
    }
  },
  plugins: []
};
