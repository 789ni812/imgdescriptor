import type { Config } from "tailwindcss"

const config = {
  darkMode: false,
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#fff",
        },
        accent: {
          DEFAULT: "#f97316",
          foreground: "#fff",
        },
        background: {
          DEFAULT: "#f8fafc",
          gradient: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
        },
        card: {
          DEFAULT: "#fff",
          foreground: "#1e293b",
        },
        border: "#e5e7eb",
        input: "#e0e7ef",
        ring: "#2563eb",
        destructive: {
          DEFAULT: "#f43f5e",
          foreground: "#fff",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        popover: {
          DEFAULT: "#fff",
          foreground: "#1e293b",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config

export default config 