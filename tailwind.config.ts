import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706", // Deep Saffron Primary Accent
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          DEFAULT: "#d97706",
          foreground: "#ffffff",
        },
        slate: {
          950: "#060b13", // Deep Obsidian Dark Background
        },
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "sans-serif"],
        display: ["Manrope", "Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 20px -3px rgba(217, 119, 6, 0.35)",
        "glow-danger": "0 0 20px -3px rgba(220, 38, 38, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
