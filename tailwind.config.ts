import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lumiere: {
          cream: "#FFF0F5",
          warm: "#F2C4D8",
          blush: "#F4C0D1",
          rose: "#D4537E",
          roseDark: "#B83A6A",
          charcoal: "#3D2035",
          muted: "#9C6B85",
          light: "#FFFFFF",
          gold: "#F4C0D1",
        },
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        accent: ["var(--font-cormorant)", "serif"],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(212,83,126,0.08)",
        "soft-lg": "0 8px 40px rgba(212,83,126,0.12)",
        glow: "0 0 30px rgba(212,83,126,0.25)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "1.5rem",
        "full": "50px",
      },
      aspectRatio: {
        "3/4": "3 / 4",
      },
      keyframes: {
        bump: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
      },
      animation: {
        bump: "bump 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;