/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { brand: "#E2B714", ink: "#323437" },
      fontFamily: { mono: ["'Roboto Mono'", "monospace"] }
    }
  },
  plugins: []
};
