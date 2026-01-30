import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rounded: ["var(--font-mplus-rounded)", "sans-serif"],
      },
      colors: {
        pop: {
          cream: "#FFF8F0",
          lavender: "#F5F0FF",
          pink: "#FF6B9D",
          pinkLight: "#FF85A2",
          orange: "#FF9F43",
          orangeLight: "#FFB347",
          mint: "#6BCB77",
          mintLight: "#4CD964",
          purple: "#A855F7",
          text: "#374151",
          textDark: "#1F2937",
        },
      },
      boxShadow: {
        pop: "0 4px 14px 0 rgba(255, 107, 157, 0.15)",
        popCard: "0 8px 24px -4px rgba(0,0,0,0.08), 0 4px 8px -2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
