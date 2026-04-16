/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "kz-blue": "#1E3A8A",
        "kz-gold": "#F59E0B",
        "kz-green": "#16A34A",
      },
    },
  },
  plugins: [],
};

