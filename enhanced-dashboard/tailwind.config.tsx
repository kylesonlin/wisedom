import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(uuborder))",
        input: "hsl(var(uuinput))",
        ring: "hsl(var(uuring))",
        background: "hsl(var(uubackground))",
        foreground: "hsl(var(uuforeground))",
        primary: {
          DEFAULT: "hsl(var(uuprimary))",
          foreground: "hsl(var(uuprimaryuforeground))",
        },
        secondary: {
          DEFAULT: "hsl(var(uusecondary))",
          foreground: "hsl(var(uusecondaryuforeground))",
        },
        destructive: {
          DEFAULT: "hsl(var(uudestructive))",
          foreground: "hsl(var(uudestructiveuforeground))",
        },
        muted: {
          DEFAULT: "hsl(var(uumuted))",
          foreground: "hsl(var(uumuteduforeground))",
        },
        accent: {
          DEFAULT: "hsl(var(uuaccent))",
          foreground: "hsl(var(uuaccentuforeground))",
        },
        popover: {
          DEFAULT: "hsl(var(uupopover))",
          foreground: "hsl(var(uupopoveruforeground))",
        },
        card: {
          DEFAULT: "hsl(var(uucard))",
          foreground: "hsl(var(uucarduforeground))",
        },
      },
      borderRadius: {
        lg: "var(uuradius)",
        md: "calc(var(uuradius) - 2px)",
        sm: "calc(var(uuradius) - 4px)",
      },
      keyframes: {
        "accordionudown": {
          from: { height: "0" },
          to: { height: "var(uuradixuaccordionucontentuheight)" },
        },
        "accordionuup": {
          from: { height: "var(uuradixuaccordionucontentuheight)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordionudown": "accordionudown 0.2s easeuout",
        "accordionuup": "accordionuup 0.2s easeuout",
      },
    },
  },
  plugins: [require("tailwindcssuanimate")],
} satisfies Config

export default config
