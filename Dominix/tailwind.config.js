/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a26",
          600: "#242432",
        },
        accent: {
          gold: "#d4a853",
          silver: "#a8b2c1",
        },
        tile: {
          bg: "#1e1e2e",
          border: "#3a3a52",
          hover: "#2a2a40",
          active: "#d4a853",
        },
      },
      fontFamily: {
        display: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
