import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: "#FAF6F0",
          100: "#F4EDE0",
          200: "#E7D7C1",
          300: "#D6BDA0",
          400: "#B89569",
          500: "#8B6914", // Marrón dorado principal
          600: "#75550F",
          700: "#5D420A",
          800: "#443007",
          900: "#2B1E04",
        },
        sage: {
          50: "#F4F7F2",
          100: "#E5ECE0",
          200: "#CCDAC2",
          300: "#AFC4A2",
          400: "#87A96B", // Verde salvia principal
          500: "#6C8E50",
          600: "#54713E",
          700: "#3F552E",
          800: "#2C3B20",
          900: "#1A2313",
        },
        cream: {
          50: "#FFFEFA",
          100: "#FFFDF5",
          200: "#FFF8E7", // Crema principal
          300: "#F7EDD2",
          400: "#EBDCBA",
          500: "#DEC8A0",
          600: "#C7AE82",
          700: "#A98E64",
          800: "#7F6745",
          900: "#4F3E26",
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
      }
    },
  },
  plugins: [],
};
export default config;
