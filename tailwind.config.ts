import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hwite: "#f7f8f8",
        sunnies: "#febe14",
        coldday: "#33847b",
        tear: "#a9dac9",
        farmersmarket: "#9cc581",
        millennial: "#ffb5b6",
        ink: "#0f0000",
        salmon: "#f76e6e",
        goldenhour: "#e98142",
      },
      fontFamily: {
        sans: ["var(--font-afacad)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
