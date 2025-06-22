const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
};

export default config; 