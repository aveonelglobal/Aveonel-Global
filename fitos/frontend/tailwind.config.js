/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fitos: {
          bg: "#0f1512",
          card: "#161f1a",
          accent: "#5fbf87",
          accentDark: "#3f8f61",
          text: "#e8f0ea",
          muted: "#8fa398",
        },
      },
    },
  },
  plugins: [],
};
