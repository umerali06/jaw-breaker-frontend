/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        colors: {
          primary: "#2596be", // Primary Blue
          accent: "#96be25", // Accent Green
        },
        neutral: {
          white: "#ffffff",
          light: "#f5f5f5",
          dark: "#1c1c1c",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        glass:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "Roboto", "sans-serif"],
      },
      fontWeight: {
        normal: 700, // Make all text bold by default
        bold: 700,
        medium: 700,
        semibold: 700,
        light: 700,
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        button: "0 4px 6px -1px rgba(37, 150, 190, 0.4)",
        "accent-button": "0 4px 6px -1px rgba(150, 190, 37, 0.4)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-in-out",
        "slide-in": "slideIn 0.5s ease-in-out",
        "pulse-slow": "pulse 3s infinite",
        "ping-slow": "pingSlow 3s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        pulse: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        pingSlow: {
          "0%": { transform: "scale(0.95)", opacity: "0.5" },
          "70%": { transform: "scale(1.1)", opacity: "0" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
