import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F2",
        surface: "#FFFDF8",
        "surface-secondary": "#F7F1DF",
        gold: {
          DEFAULT: "#E8B84A",
          dark: "#8F5D0E",
        },
        ink: "#111827",
        muted: "#5B5B54",
        border: "#E8E1D2",
        risk: {
          high: "#A23B32",
          medium: "#8A5A10",
          low: "#3A5E45",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 24, 39, 0.04), 0 1px 3px rgba(17, 24, 39, 0.06)",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
