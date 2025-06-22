import type { Config } from "tailwindcss";
import path from "path";

const config: Config = {
  content: [
    path.join(__dirname, "./src/**/*.{js,ts,jsx,tsx,mdx}")
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#6366f1", // Indigo-500
          dark: "#4338ca",   // Indigo-700
          light: "#a5b4fc",  // Indigo-300
        },
        accent: {
          DEFAULT: "#f59e42", // Orange-400
          dark: "#b45309",   // Orange-700
          light: "#fde68a",  // Orange-200
        },
      },
    },
  },
  plugins: [],
};

export default config; 