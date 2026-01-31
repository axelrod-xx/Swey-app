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
        sans: ["var(--font-inter)", "var(--font-noto-sans)", "sans-serif"],
      },
      colors: {
        accent: {
          indigo: "#6366f1",
          pink: "#ec4899",
        },
      },
      backgroundImage: {
        "gradient-electric": "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
