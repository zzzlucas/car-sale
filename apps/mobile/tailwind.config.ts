import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: {
    extend: {
      colors: {
        background: "#f8f9fa",
        primary: "#004c4c",
        "primary-container": "#006666",
        secondary: "#904d00",
        surface: "#f8f9fa",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "surface-variant": "#e1e3e4",
        outline: "#6f7979",
        "on-surface": "#191c1d",
        "on-surface-variant": "#3f4948",
      },
      spacing: {
        "margin-page": "20px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "24px",
        "inset-card": "16px",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(0, 0, 0, 0.06)",
      },
      fontFamily: {
        sans: ["PingFang SC", "Public Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
