import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rounded: ["var(--font-mplus-rounded)", "sans-serif"],
      },
      colors: {
        candy: {
          cream: "#FFFCF5",
          peach: "#FF9EAA",
          mint: "#87E3D3",
          lavender: "#C3B1E1",
          text: "#4A4458",
          textDark: "#2D2838",
        },
      },
      boxShadow: {
        "candy-jelly": "0 4px 0 0 rgba(0,0,0,0.08), 0 6px 12px -2px rgba(255,158,170,0.2)",
        "candy-card": "0 3px 0 0 rgba(0,0,0,0.06), 0 6px 16px -4px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
