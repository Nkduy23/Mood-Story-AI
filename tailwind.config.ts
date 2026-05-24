module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          purple: "#9b7cf4",
          pink: "#f472b6",
        },
        // Dark theme surfaces
        surface: {
          DEFAULT: "#0a0a0f",
          card: "#14121f",
          elevated: "#1a1828",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
};
