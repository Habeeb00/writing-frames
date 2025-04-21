/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "var(--cursor-blue)",
        secondary: "var(--cursor-purple)",
        danger: "var(--cursor-red)"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      animation: {
        "fade-in": "fadeIn 1s ease-in-out forwards"
      }
    }
  },
  plugins: []
}
